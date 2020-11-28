import { Guid } from "../CommonDomainObjects";
import { ClassMembershipEvaluator } from "../Ontology/ClassMembershipEvaluator";
import { IClass } from "../Ontology/IClass";
import { IDataRange } from "../Ontology/IDataRange";
import { IOntology } from "../Ontology/IOntology";
import { IPropertyExpression } from "../Ontology/IPropertyExpression";
import { ISubClassOf } from "../Ontology/ISubClassOf";
import { deals } from "./Deals";

export type PathSegment = [string, object];
export type Path = [object, PathSegment[]];

export interface IErrors
{
    Mandatory: string,
    Invalid  : string
}

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
    ontology        : IOntology,
    classifications : Map<object, Set<IClass>>,
    applicableStages: Set<Guid>
    ): Map<object, Map<string, ISubClassOf[]>>
{
    var evaluator = new ClassMembershipEvaluator(
        ontology,
        classifications);

    let errors = new Map<object, Map<string, ISubClassOf[]>>();
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

export function Validate3(
    ontology        : IOntology,
    classifications : Map<object, Set<IClass>>,
    applicableStages: Set<Guid>
    ): Map<object, object>
{
    var evaluator = new ClassMembershipEvaluator(
        ontology,
        classifications);

    let errors = new Map<object, object>();
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
                                individualErrors = {};
                                errors.set(
                                    individual,
                                    individualErrors);
                            }

                            if(!individualErrors[propertyName])
                                individualErrors[propertyName] = [];

                            individualErrors[propertyName].push(subClassOf);
                        }
                }
    }

    return errors;
}

export function Validate4(
    ontology        : IOntology,
    classifications : Map<object, Set<IClass>>,
    applicableStages: Set<Guid>
    ): Map<object, Map<string, Set<keyof IErrors>>>
{
    var evaluator = new ClassMembershipEvaluator(
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

                            propertyErrors.add("Mandatory");
                        }
                }
    }

    return errors;
}

export function ValidateProperties(
    ontology   : IOntology,
    individuals: Set<object>
    ): Map<object, Map<string, IDataRange[]>>
{
    let errors = new Map<object, Map<string, IDataRange[]>>();
    for(let dataPropertyRange of ontology.Get(ontology.IsAxiom.IDataPropertyRange))
        for(let individual of individuals)
            if(dataPropertyRange.DataPropertyExpression.LocalName in individual)
                if(!dataPropertyRange.Range.HasMember(individual[dataPropertyRange.DataPropertyExpression.LocalName]))
                {
                    let individualErrors = errors.get(individual);
                    if(!individualErrors)
                    {
                        individualErrors = new Map<string, IDataRange[]>();
                        errors.set(
                            individual,
                            individualErrors);
                    }

                    let propertyErrors = individualErrors.get(dataPropertyRange.DataPropertyExpression.LocalName);
                    if(!propertyErrors)
                    {
                        propertyErrors = [];
                        individualErrors.set(
                            dataPropertyRange.DataPropertyExpression.LocalName,
                            propertyErrors);
                    }

                    propertyErrors.push(dataPropertyRange.Range);
                }
    return errors;
}
