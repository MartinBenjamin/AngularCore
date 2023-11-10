import { asapScheduler, BehaviorSubject, combineLatest, Observable } from "rxjs";
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { Guid } from "../CommonDomainObjects";
import { IEavStore } from "../EavStore/IEavStore";
import { ClassExpressionObservableInterpreter, PropertyExpressionObservableGenerator } from "../Ontology/ClassExpressionObservableInterpreter";
import { AtomInterpreter, ComparisonAtom, IComparisonAtom, IPropertyAtom, IsDLSafeRule, PropertyAtom, RuleContradictionInterpreter } from "../Ontology/DLSafeRule";
import { IAxiom } from "../Ontology/IAxiom";
import { IClassExpressionSelector } from '../Ontology/IClassExpressionSelector';
import { IOntology } from "../Ontology/IOntology";
import { IProperty } from '../Ontology/IProperty';
import { ISubClassOf } from '../Ontology/ISubClassOf';
import { PropertyNameSelector } from "../Ontology/PropertyNameSelector";
import { Wrap, Wrapped, WrapperType } from '../Ontology/Wrapped';
import { annotations } from './Annotations';
import { IErrors } from './Validate';

const empty = new Set<any>();

export type Error = keyof IErrors | IAxiom

type ObservableParams<P> = { [Parameter in keyof P]: Observable<P[Parameter]>; };
const wrap = <TIn extends any[], TOut>(
    map: (...params: TIn) => TOut,
    ...params: ObservableParams<TIn>
    ): Observable<TOut> => !params.length ? new BehaviorSubject(map(...<TIn>[])) : combineLatest(
        params,
        map);

function SubClassOfContraditionInterpreter<T extends WrapperType>(
    wrap                      : Wrap<T>,
    classExpressionInterpreter: IClassExpressionSelector<Wrapped<T, Set<any>>>
    ): (subclassOf: ISubClassOf) => Wrapped<T, Set<any>>
{
    return (subclassOf: ISubClassOf) => wrap(
        (superClass, subClass) => 
        {
            const contradictions = [...subClass].filter(element => !superClass.has(element));
            return contradictions.length ? new Set<any>(contradictions) : empty;
        },
        subclassOf.SuperClassExpression.Select(classExpressionInterpreter),
        subclassOf.SubClassExpression.Select(classExpressionInterpreter));
}

export function ObserveErrors(
    ontology        : IOntology,
    store           : IEavStore,
    applicableStages: Observable<Set<Guid>>
    ): Observable<Map<any, Map<string, Set<Error>>>>
{
    const classEpressionInterpreter = new ClassExpressionObservableInterpreter(
        ontology,
        store);

    const propertyExpressionInterpreter = new PropertyExpressionObservableGenerator(store);

    const atomInterpreter = new AtomInterpreter<WrapperType.Observable>(
        wrap,
        propertyExpressionInterpreter,
        classEpressionInterpreter);

    const subClassOfContraditionInterpreter = SubClassOfContraditionInterpreter<WrapperType.Observable>(
        wrap,
        classEpressionInterpreter);

    const ruleContradicitionInterpreter = RuleContradictionInterpreter(
        wrap,
        atomInterpreter);

    const dataRangeObservables: Observable<[string, Error, Set<any>]>[] = [...ontology.Get(ontology.IsAxiom.IDataPropertyRange)].map(
        dataPropertyRange => store.Observe(dataPropertyRange.DataPropertyExpression.Select(PropertyNameSelector)).pipe(
            map(relations =>
                [
                    dataPropertyRange.DataPropertyExpression.Select(PropertyNameSelector),
                    "Invalid",
                    new Set<any>(relations.filter(([, range]) => !dataPropertyRange.Range.HasMember(range)).map(([domain,]) => domain))
                ])));

    return applicableStages.pipe(switchMap(applicableStages =>
    {
        let observables: Observable<[string, Error, Set<any>]>[] = [...dataRangeObservables];
        for(let rule of ontology.Get(IsDLSafeRule))
            for(let annotation of rule.Annotations)
                if(annotation.Property === annotations.RestrictedfromStage &&
                   applicableStages.has(annotation.Value))
                {
                    const comparison = rule.Head.find<IComparisonAtom>((atom): atom is IComparisonAtom => atom instanceof ComparisonAtom);
                    const lhsProperty = rule.Head.find<IPropertyAtom>((atom): atom is IPropertyAtom => atom instanceof PropertyAtom && atom.Range === comparison.Lhs);

                    if(comparison && lhsProperty)
                        observables.push(
                            wrap(
                                contraditions => [
                                    (<IProperty>lhsProperty.PropertyExpression).LocalName,
                                    rule,
                                    new Set(contraditions.map(o => o[<string>lhsProperty.Domain]))],
                                ruleContradicitionInterpreter(rule)));
                }

        for(let subClassOf of ontology.Get(ontology.IsAxiom.ISubClassOf))
            for(let annotation of subClassOf.Annotations)
                if(annotation.Property === annotations.RestrictedfromStage &&
                   applicableStages.has(annotation.Value))
                {
                    let propertyName;
                    for(let annotationAnnotation of annotation.Annotations)
                        if(annotationAnnotation.Property === annotations.NominalProperty)
                        {
                            propertyName = annotationAnnotation.Value;
                            break;
                        }

                    if(!propertyName && ontology.IsClassExpression.IPropertyRestriction(subClassOf.SuperClassExpression))
                        propertyName = subClassOf.SuperClassExpression.PropertyExpression.Select(PropertyNameSelector);

                    let errorAnnotation = annotation.Annotations.find(annotation => annotation.Property === annotations.Error);
                    let error = errorAnnotation ? errorAnnotation.Value : "Mandatory";

                    observables.push(
                        subClassOfContraditionInterpreter(subClassOf).pipe(
                            distinctUntilChanged(),
                            map(
                                contradictions => [
                                    propertyName,
                                    error,
                                    contradictions])));
                }

        return combineLatest(observables).pipe(debounceTime(0, asapScheduler), map(errors =>
            {
                let errorMap = new Map<any, Map<string, Set<Error>>>();
                errors.forEach(
                    ([property, error, individuals]) =>
                    {
                        individuals.forEach(
                            individual =>
                            {
                                let individualErrors = errorMap.get(individual);
                                if(!individualErrors)
                                {
                                    individualErrors = new Map<string, Set<Error>>();
                                    errorMap.set(
                                        individual,
                                        individualErrors);
                                }

                                let propertyErrors = individualErrors.get(property);
                                if(!propertyErrors)
                                {
                                    propertyErrors = new Set<Error>();
                                    individualErrors.set(
                                        property,
                                        propertyErrors);
                                }

                                propertyErrors.add(error);
                            });
                    });
                return errorMap;
            }));
    }));
}

