import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { Guid } from "../CommonDomainObjects";
import { ClassMembershipEvaluator } from "../Ontology/ClassMembershipEvaluator";
import { IClass } from "../Ontology/IClass";
import { IOntology } from "../Ontology/IOntology";
import { annotations } from './Annotations';
import { IStore, ObservableGenerator } from "../Ontology/ObservableGenerator";

export interface IErrors
{
    Mandatory       : string,
    Invalid         : string,
    MustBe100Percent: string
}

export function ObserveErrors(
    ontology        : IOntology,
    store           : IStore,
    entity          : object,
    propertyName    : string
    ): Observable<Set<keyof IErrors>>
{
    const generator = new ObservableGenerator(
        ontology,
        store);

            for(let subClassOf of ontology.Get(ontology.IsAxiom.ISubClassOf))
                for(let annotation of subClassOf.Annotations)
                    if(annotation.Property === annotations.RestrictedfromStage)
                    {
                        let name;
                        for(let annotationAnnotation of annotation.Annotations)
                            if(annotationAnnotation.Property === annotations.NominalProperty)
                            {
                                name = annotationAnnotation.Value;
                                break;
                            }

                        if(!name && ontology.IsClassExpression.IPropertyRestriction(subClassOf.SuperClassExpression))
                            name = subClassOf.SuperClassExpression.PropertyExpression.LocalName;

                        if()
                        let x = combineLatest(
                            subClassOf.SuperClassExpression.Select(generator),
                            subClassOf.SubClassExpression.Select(generator),
                            (superClassExpression, subClassExpression) => new Set<any>([...subClassExpression].filter(element => superClassExpression.has(element))));

                            let individualErrors = errors.get(individual);
                            if(!individualErrors)
                            {
                                individualErrors = new Map<string, Set<keyof IErrors>>();
                                errors.set(
                                    individual,
                                    individualErrors);
                            }

                            let propertyErrors = individualErrors.get(propertyName);
                            if(!propertyErrors)
                            {
                                propertyErrors = new Set<keyof IErrors>();
                                individualErrors.set(
                                    propertyName,
                                    propertyErrors);
                            }

                            let errorAnnotation = annotation.Annotations.find(annotation => annotation.Property === annotations.Error);
                            propertyErrors.add(errorAnnotation ? errorAnnotation.Value : "Mandatory");
                        }
                }
    }

    return errors;
}
