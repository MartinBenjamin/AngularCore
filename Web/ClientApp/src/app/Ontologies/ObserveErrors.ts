import { combineLatest, Observable } from "rxjs";
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { Guid } from "../CommonDomainObjects";
import { IsDLSafeRule, ObserveContradictions } from "../Ontology/DLSafeRule";
import { IAxiom } from "../Ontology/IAxiom";
import { IEavStore } from "../Ontology/IEavStore";
import { IOntology } from "../Ontology/IOntology";
import { ISubClassOf } from "../Ontology/ISubClassOf";
import { ObservableGenerator } from "../Ontology/ObservableGenerator";
import { annotations } from './Annotations';
import { IErrors } from './Validate';

const empty = new Set<any>();

export function ObserveRestrictedFromStage(
    generator          : ObservableGenerator,
    subClassOf         : ISubClassOf,
    applicableStages   : Observable<Set<Guid>>,
    restrictedFromStage: Guid,
    propertyName       : string,
    error              : keyof IErrors
    ): Observable<[string, keyof IErrors, Set<any>]>
{
    return combineLatest(
        subClassOf.SuperClassExpression.Select(generator),
        subClassOf.SubClassExpression.Select(generator),
        applicableStages.pipe(map(applicableStages => applicableStages.has(restrictedFromStage))),
        (
            superClassExpression,
            subClassExpression,
            active
            ) =>
            [
                propertyName,
                error,
                active ? new Set<any>([...subClassExpression].filter(element => !superClassExpression.has(element))) : empty
            ]);
}

export function ObserveErrors(
    ontology        : IOntology,
    store           : IEavStore,
    applicableStages: Observable<Set<Guid>>
    ): Observable<Map<any, Map<string, Set<keyof IErrors>>>>
{
    const generator = new ObservableGenerator(
        ontology,
        store);

    let observables: Observable<[string, keyof IErrors, Set<any>]>[] = [...ontology.Get(ontology.IsAxiom.IDataPropertyRange)].map(
        dataPropertyRange => store.ObserveAttribute(dataPropertyRange.DataPropertyExpression.LocalName).pipe(
            map(relations =>
                [
                    dataPropertyRange.DataPropertyExpression.LocalName,
                    "Invalid",
                    new Set<any>(relations.filter(([, range]) => !dataPropertyRange.Range.HasMember(range)).map(([domain,]) => domain))
                ])));

    for(let subClassOf of ontology.Get(ontology.IsAxiom.ISubClassOf))
        for(let annotation of subClassOf.Annotations)
            if(annotation.Property === annotations.RestrictedfromStage)
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
                    generator,
                    subClassOf,
                    applicableStages,
                    annotation.Value,
                    propertyName,
                    error));
            }

    return combineLatest(
        observables,
        (...errors) =>
        {
            let errorMap = new Map<any, Map<string, Set<keyof IErrors>>>();
            errors.forEach(
                ([property, error, individuals]) =>
                {
                    individuals.forEach(
                        individual =>
                        {
                            let individualErrors = errorMap.get(individual);
                            if(!individualErrors)
                            {
                                individualErrors = new Map<string, Set<keyof IErrors>>();
                                errorMap.set(
                                    individual,
                                    individualErrors);
                            }

                            let propertyErrors = individualErrors.get(property);
                            if(!propertyErrors)
                            {
                                propertyErrors = new Set<keyof IErrors>();
                                individualErrors.set(
                                    property,
                                    propertyErrors);
                            }

                            propertyErrors.add(error);
                        });
                });
            return errorMap;
        });
}

export type Error = keyof IErrors | IAxiom

export function ObserveRestrictedFromStageSwitchMap(
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


export function ObserveErrorsSwitchMap(
    ontology        : IOntology,
    store           : IEavStore,
    applicableStages: Observable<Set<Guid>>
    ): Observable<Map<any, Map<string, Set<Error>>>>
{
    const generator = new ObservableGenerator(
        ontology,
        store);

    const dataRangeObservables: Observable<[string, Error, Set<any>]>[] = [...ontology.Get(ontology.IsAxiom.IDataPropertyRange)].map(
        dataPropertyRange => store.ObserveAttribute(dataPropertyRange.DataPropertyExpression.LocalName).pipe(
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
            store,
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

                    observables.push(ObserveRestrictedFromStageSwitchMap(
                        subClassOf.SuperClassExpression.Select(generator),
                        subClassOf.SubClassExpression.Select(generator),
                        propertyName,
                        error));
                }

        return combineLatest(observables).pipe(debounceTime(0), map(errors =>
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

