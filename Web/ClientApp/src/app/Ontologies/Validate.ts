import { ClassMembershipEvaluator } from "../Ontology/ClassMembershipEvaluator";
import { IClass } from "../Ontology/IClass";
import { IOntology } from "../Ontology/IOntology";
import { IPropertyExpression } from "../Ontology/IPropertyExpression";
import { ISubClassOf } from "../Ontology/ISubClassOf";
import { deals } from "./Deals";

export function Validate(
    ontology       : IOntology,
    classifications: Map<object, Set<IClass>>
    ): Map<object, Map<IPropertyExpression, ISubClassOf[]>>
{
    var evaluator = new ClassMembershipEvaluator(
        ontology,
        classifications);

    let errors = new Map<object, Map<IPropertyExpression, ISubClassOf[]>>();
    for(let keyValuePair of classifications.entries())
    {
        let individual = keyValuePair[0];
        for(let class$ of keyValuePair[1])
            for(let subClassOf of ontology.Get(ontology.IsAxiom.ISubClassOf))
                if(subClassOf.SubClassExpression === class$)
                {
                    let superClassExpression = subClassOf.SuperClassExpression;
                    if(ontology.IsClassExpression.IPropertyRestriction(superClassExpression))
                        for(let annotation of subClassOf.Annotations)
                            if(annotation.Property === deals.RestrictedfromStage &&
                                subClassOf.SuperClassExpression.Evaluate(
                                    evaluator,
                                    individual))
                            {
                                let individualErrors = errors.get(individual);
                                if(!individualErrors)
                                {
                                    individualErrors = new Map<IPropertyExpression, ISubClassOf[]>();
                                    errors.set(
                                        individual,
                                        individualErrors);
                                }

                                let propertyErrors = individualErrors.get(superClassExpression.PropertyExpression);
                                if(!propertyErrors)
                                {
                                    propertyErrors = [];
                                    individualErrors.set(
                                        superClassExpression.PropertyExpression,
                                        propertyErrors);
                                }

                                propertyErrors.push(subClassOf);
                            }
                }
    }

    return errors;
}

export function Validate2(
    ontology       : IOntology,
    classifications: Map<object, Set<IClass>>
    ): Map<object, Map<string, ISubClassOf[]>>
{
    var evaluator = new ClassMembershipEvaluator(
        ontology,
        classifications);

    let errors = new Map<object, Map<string, ISubClassOf[]>>();
    for(let keyValuePair of classifications.entries())
    {
        let individual = keyValuePair[0];
        for(let class$ of keyValuePair[1])
            for(let subClassOf of ontology.Get(ontology.IsAxiom.ISubClassOf))
                if(subClassOf.SubClassExpression === class$)
                {
                    let superClassExpression = subClassOf.SuperClassExpression;
                    if(ontology.IsClassExpression.IPropertyRestriction(superClassExpression))
                        for(let annotation of subClassOf.Annotations)
                            if(annotation.Property === deals.RestrictedfromStage &&
                                subClassOf.SuperClassExpression.Evaluate(
                                    evaluator,
                                    individual))
                            {
                                let propertyName = superClassExpression.PropertyExpression.LocalName;
                                for(let annotationAnnotation of annotation.Annotations)
                                    if(annotationAnnotation.Property === deals.SubPropertyName)
                                    {
                                        propertyName = annotationAnnotation.Value;
                                        break;
                                    }

                                let individualErrors = errors.get(individual);
                                if(!individualErrors)
                                {
                                    individualErrors = new Map<string, ISubClassOf[]>();
                                    errors.set(
                                        individual,
                                        individualErrors);
                                }

                                let propertyErrors = individualErrors.get(propertyName);
                                if(!propertyErrors)
                                {
                                    propertyErrors = [];
                                    individualErrors.set(
                                        propertyName,
                                        propertyErrors);
                                }

                                propertyErrors.push(subClassOf);
                            }
                }
    }

    return errors;
}
