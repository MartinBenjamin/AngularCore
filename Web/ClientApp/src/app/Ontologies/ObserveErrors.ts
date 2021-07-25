import { combineLatest, Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { IDataRange } from '../Ontology/IDataRange';
import { IOntology } from "../Ontology/IOntology";
import { ISubClassOf } from "../Ontology/ISubClassOf";
import { IStore, ObservableGenerator } from "../Ontology/ObservableGenerator";
import { annotations } from './Annotations';
import { IErrors } from './Validate';

export function ObserveRestrictedFromStage(
    generator   : ObservableGenerator,
    subClassOf  : ISubClassOf,
    propertyName: string,
    error       : keyof IErrors
    ): Observable<[string, keyof IErrors, Set<any>]>
{
    return combineLatest(
        subClassOf.SuperClassExpression.Select(generator),
        subClassOf.SubClassExpression.Select(generator),
        (superClassExpression, subClassExpression) =>
            [
                propertyName,
                error,
                new Set<any>([...subClassExpression].filter(element => !superClassExpression.has(element)))
            ]);
}

export function ObserveDataRangeError(
    store       : IStore,
    dataRange   : IDataRange,
    propertyName: string
    ): Observable<[string, keyof IErrors, Set<any>]>
{
    return store.ObserveProperty(propertyName).pipe(
        map(elements => [propertyName, "Invalid", new Set<any>(elements.filter(element => !dataRange.HasMember(element[1])).map(element => element[0]))));
}

export function ObserveErrors(
    ontology: IOntology,
    store   : IStore
    ): Observable<Map<object, Map<string, Set<keyof IErrors>>>>
{
    const generator = new ObservableGenerator(
        ontology,
        store);

    let observables: Observable<[string, keyof IErrors, Set<any>]>[] = [...ontology.Get(ontology.IsAxiom.IDataPropertyRange)].map(
        dataPropertyRange => store.ObserveProperty(dataPropertyRange.DataPropertyExpression.LocalName).pipe(
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
