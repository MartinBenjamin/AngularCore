import { Guid } from "../CommonDomainObjects";
import { ClassMembershipEvaluator } from "../Ontology/ClassMembershipEvaluator";
import { IClass } from "../Ontology/IClass";
import { IOntology } from "../Ontology/IOntology";
import { deals } from "./Deals";

export interface IErrors
{
    Mandatory       : string,
    Invalid         : string,
    MustBe100Percent: string
}

export function Validate(
    ontology        : IOntology,
    classifications : Map<object, Set<IClass>>,
    applicableStages: Set<Guid>
    ): Map<object, Map<string, Set<keyof IErrors>>>
{
    let evaluator = new ClassMembershipEvaluator(
        ontology,
        classifications);

    let errors = new Map<object, Map<string, Set<keyof IErrors>>>();
    for(let dataPropertyRange of ontology.Get(ontology.IsAxiom.IDataPropertyRange))
        for(let individual of classifications.keys())
            if(dataPropertyRange.DataPropertyExpression.LocalName in individual)
            {
                let value = individual[dataPropertyRange.DataPropertyExpression.LocalName];
                if(value != null &&
                   !dataPropertyRange.Range.HasMember(individual[dataPropertyRange.DataPropertyExpression.LocalName]))
                {
                    let individualErrors = errors.get(individual);
                    if(!individualErrors)
                    {
                        individualErrors = new Map<string, Set<keyof IErrors>>();
                        errors.set(
                            individual,
                            individualErrors);
                    }

                    let propertyErrors = individualErrors.get(dataPropertyRange.DataPropertyExpression.LocalName);
                    if(!propertyErrors)
                    {
                        propertyErrors = new Set<keyof IErrors>();
                        individualErrors.set(
                            dataPropertyRange.DataPropertyExpression.LocalName,
                            propertyErrors);
                    }

                    propertyErrors.add("Invalid");
                }
            }

    for(let keyValuePair of classifications)
    {
        let individual = keyValuePair[0];
        for(let class$ of keyValuePair[1])
            for(let subClassOf of ontology.Get(ontology.IsAxiom.ISubClassOf))
                if(subClassOf.SubClassExpression === class$)
                {
                    let superClassExpression = subClassOf.SuperClassExpression;
                    for(let annotation of subClassOf.Annotations)
                        if(annotation.Property === deals.RestrictedfromStage &&
                            applicableStages.has(annotation.Value) &&
                            !subClassOf.SuperClassExpression.Evaluate(
                                evaluator,
                                individual))
                        {
                            let propertyName;
                            for(let annotationAnnotation of annotation.Annotations)
                                if(annotationAnnotation.Property === deals.NominalProperty)
                                {
                                    propertyName = annotationAnnotation.Value;
                                    break;
                                }

                            if(!propertyName &&
                                ontology.IsClassExpression.IPropertyRestriction(superClassExpression))
                                    propertyName = superClassExpression.PropertyExpression.LocalName;

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

                            let errorAnnotation = annotation.Annotations.find(annotation => annotation.Property === deals.Error);
                            propertyErrors.add(errorAnnotation ? errorAnnotation.Value : "Mandatory");
                        }
                }
    }

    return errors;
}
