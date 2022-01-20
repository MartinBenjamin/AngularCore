import { combineLatest, Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { Guid } from "../CommonDomainObjects";
import { IEavStore } from "../Ontology/IEavStore";
import { IOntology } from "../Ontology/IOntology";
import { ISubClassOf } from "../Ontology/ISubClassOf";
import { ObservableGenerator } from "../Ontology/ObservableGenerator";
import { annotations } from './Annotations';
import { IErrors } from './Validate';

const noErrors = new Set<any>();

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
                active ? new Set<any>([...subClassExpression].filter(element => !superClassExpression.has(element))) : noErrors
            ]);
}

export function ObserveErrors(
    ontology        : IOntology,
    store           : IEavStore,
    applicableStages: Observable<Set<Guid>>
    ): Observable<Map<object, Map<string, Set<keyof IErrors>>>>
{
    const generator = new ObservableGenerator(
        ontology,
        store);

    let observables: Observable<[string, keyof IErrors, Set<any>]>[] = [...ontology.Get(ontology.IsAxiom.IDataPropertyRange)].map(
        dataPropertyRange => store.ObserveAttribute(dataPropertyRange.DataPropertyExpression.LocalName).pipe(
            map(elements =>
                [
                    dataPropertyRange.DataPropertyExpression.LocalName,
                    "Invalid",
                    new Set<any>(elements.filter(element => !dataPropertyRange.Range.HasMember(element[1])).map(element => element[0]))
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
        (...observables) =>
        {
            let errors = new Map<object, Map<string, Set<keyof IErrors>>>();
            observables.forEach(
                observable =>
                {
                    observable[2].forEach(
                        individual =>
                        {
                            let individualErrors = errors.get(individual);
                            if(!individualErrors)
                            {
                                individualErrors = new Map<string, Set<keyof IErrors>>();
                                errors.set(
                                    individual,
                                    individualErrors);
                            }

                            let propertyErrors = individualErrors.get(observable[0]);
                            if(!propertyErrors)
                            {
                                propertyErrors = new Set<keyof IErrors>();
                                individualErrors.set(
                                    observable[0],
                                    propertyErrors);
                            }

                            propertyErrors.add(observable[1]);
                        });
                });
            return errors;
        });
}
