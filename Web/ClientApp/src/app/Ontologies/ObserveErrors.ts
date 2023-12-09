import { asapScheduler, BehaviorSubject, combineLatest, Observable } from "rxjs";
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { Guid } from "../CommonDomainObjects";
import { IEavStore } from "../EavStore/IEavStore";
import { ClassExpressionObservableInterpreter } from "../Ontology/ClassExpressionObservableInterpreter";
import { ComparisonAtom, IComparisonAtom, IPropertyAtom, IsDLSafeRule, PropertyAtom } from "../Ontology/DLSafeRule";
import { IAxiom } from "../Ontology/IAxiom";
import { IOntology } from "../Ontology/IOntology";
import { IProperty } from '../Ontology/IProperty';
import { PropertyNameSelector } from "../Ontology/PropertyNameSelector";
import { RuleContradictionInterpreter } from "../Ontology/RuleContradictionInterpreter";
import { SubClassOfContradictionInterpreter } from "../Ontology/SubClassOfContradictionInterpreter";
import { WrapperType } from '../Ontology/Wrapped';
import { annotations } from './Annotations';
import { IErrors } from './Validate';

export type Error = keyof IErrors | IAxiom

type ObservableParams<P> = { [Parameter in keyof P]: Observable<P[Parameter]>; };
const wrap = <TIn extends any[], TOut>(
    map: (...params: TIn) => TOut,
    ...params: ObservableParams<TIn>
    ): Observable<TOut> => !params.length ? new BehaviorSubject(map(...<TIn>[])) : combineLatest(
        params,
        map);

export function ObserveErrors(
    ontology        : IOntology,
    store           : IEavStore,
    applicableStages: Observable<Set<Guid>>
    ): Observable<Map<any, Map<string, Set<Error>>>>
{
    const classEpressionInterpreter = new ClassExpressionObservableInterpreter(
        ontology,
        store);

    const propertyExpressionInterpreter = classEpressionInterpreter.PropertyExpressionInterpreter;
    const atomInterpreter = propertyExpressionInterpreter.AtomInterpreter;

    const subClassOfContraditionInterpreter = SubClassOfContradictionInterpreter<WrapperType.Observable>(
        wrap,
        classEpressionInterpreter);

    const ruleContradicitionInterpreter = RuleContradictionInterpreter(
        wrap,
        atomInterpreter);

    const dataRangeObservables: Observable<[string, Error, Set<any>]>[] = [...ontology.Get(ontology.IsAxiom.IDataPropertyRange)].map(
        dataPropertyRange => dataPropertyRange.DataPropertyExpression.Select(propertyExpressionInterpreter).pipe(
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

