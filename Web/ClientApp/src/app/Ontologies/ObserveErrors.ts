import { asapScheduler, combineLatest, Observable } from "rxjs";
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { Guid } from "../CommonDomainObjects";
import { IsDLSafeRule, ObserveContradictions } from "../Ontology/DLSafeRule";
import { IAxiom } from "../Ontology/IAxiom";
import { IEavStore } from "../Ontology/IEavStore";
import { IOntology } from "../Ontology/IOntology";
import { ObservableGenerator } from "../Ontology/ObservableGenerator";
import { annotations } from './Annotations';
import { IErrors } from './Validate';

const empty = new Set<any>();

export type Error = keyof IErrors | IAxiom

function ObserveRestrictedFromStage(
    superClass  : Observable<Set<any>>,
    subClass    : Observable<Set<any>>,
    propertyName: string,
    error       : Error
    ): Observable<[string, Error, Set<any>]>
{
    return combineLatest(
        superClass,
        subClass,
        (superClass, subClass) =>
        {
            const contradictions = [...subClass].filter(element => !superClass.has(element));
            return contradictions.length ? new Set<any>(contradictions) : empty;
        }).pipe(
            distinctUntilChanged(),
            map(
                contradictions => [
                    propertyName,
                    error,
                    contradictions]));
}

export function ObserveErrors(
    ontology        : IOntology,
    store           : IEavStore,
    applicableStages: Observable<Set<Guid>>
    ): Observable<Map<any, Map<string, Set<Error>>>>
{
    const generator = new ObservableGenerator(
        ontology,
        store);

    const dataRangeObservables: Observable<[string, Error, Set<any>]>[] = [...ontology.Get(ontology.IsAxiom.IDataPropertyRange)].map(
        dataPropertyRange => store.Observe(dataPropertyRange.DataPropertyExpression.LocalName).pipe(
            map(relations =>
                [
                    dataPropertyRange.DataPropertyExpression.LocalName,
                    "Invalid",
                    new Set<any>(relations.filter(([, range]) => !dataPropertyRange.Range.HasMember(range)).map(([domain,]) => domain))
                ])));

    return applicableStages.pipe(switchMap(applicableStages =>
    {
        let observables: Observable<[string, Error, Set<any>]>[] = [...dataRangeObservables];
        const ruleContradictions = ObserveContradictions(
            ontology,
            generator,
            generator,
            ontology.Get(IsDLSafeRule));
        observables.push(...ruleContradictions);

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
                        propertyName = subClassOf.SuperClassExpression.PropertyExpression.LocalName;

                    let errorAnnotation = annotation.Annotations.find(annotation => annotation.Property === annotations.Error);
                    let error = errorAnnotation ? errorAnnotation.Value : "Mandatory";

                    observables.push(ObserveRestrictedFromStage(
                        subClassOf.SuperClassExpression.Select(generator),
                        subClassOf.SubClassExpression.Select(generator),
                        propertyName,
                        error));
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

