import { IOntology } from "../Ontology/IOntology";
import { IClass } from "../Ontology/IClass";
import { IPropertyExpression } from "../Ontology/IPropertyExpression";
import { ISubClassOf } from "../Ontology/ISubClassOf";
import { ClassMembershipEvaluator } from "../Ontology/ClassMembershipEvaluator";
import { deals } from "./Deals";

export function Validate(
    ontology       : IOntology,
    classifications: Map<object, Set<IClass>>
    ): Map<object, Map<IPropertyExpression, ISubClassOf>>
{
    var evaluator = new ClassMembershipEvaluator(
        ontology,
        classifications);
    return null;

    //for(let keyValuePair of classifications.entries())
    //{
    //    let individual = keyValuePair[0];
    //    for(let class$ of keyValuePair[1])
    //        for(let subClassOf of ontology.Get(ontology.IsAxiom.ISubClassOf))
    //            if(subClassOf.SubClassExpression === class$ &&
    //               subClassOf.SuperClassExpression instanceof IPropertyRestriction)
    //                for(let annotation of subClassOf.Annotations)
    //                    if(annotation.Property === deals.RestrictedfromStage &&
    //                        subClassOf.SuperClassExpression.Evaluate(
    //                            evaluator,
    //                            individual)
                          
    //}
    //    for(let class$ )
    //return (
    //    from keyValuePair in classifications
    //let individual = keyValuePair.Key
    //from classExpression in keyValuePair.Value
    //from subClassOf in ontology.Get<ISubClassOf>()
    //from annotation in subClassOf.Annotations
    //where
    //subClassOf.SubClassExpression == classExpression &&
    //    subClassOf.SuperClassExpression is IPropertyRestriction &&
    //        annotation.Property.Iri == "Validation.Restriction" &&
    //        !subClassOf.SuperClassExpression.Evaluate(
    //            evaluator,
    //            individual)
    //group subClassOf by individual into errorsGroupedByIndividual
    //select errorsGroupedByIndividual
    //        ).ToDictionary(
    //    group => group.Key,
    //    group => group.ToLookup(
    //        g => ((IPropertyRestriction)g.SuperClassExpression).PropertyExpression));
}
