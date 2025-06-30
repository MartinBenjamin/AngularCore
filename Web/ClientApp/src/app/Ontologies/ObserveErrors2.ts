import { asapScheduler, combineLatest, Observable } from "rxjs";
import { debounceTime, map } from 'rxjs/operators';
import { Guid } from "../CommonDomainObjects";
import { DealStageIdentifier } from '../Deals';
import { BuiltIn } from '../EavStore/BuiltIn';
import { IsVariable, Not, Rule, Variable } from "../EavStore/Datalog";
import { IEavStore } from "../EavStore/IEavStore";
import { AxiomInterpreter } from "../Ontology/AxiomInterpreterDatalog";
import { DataRange } from '../Ontology/DataRange';
import { ComparisonAtom, IComparisonAtom, IPropertyAtom, IsDLSafeRule, PropertyAtom } from "../Ontology/DLSafeRule";
import { IAxiom } from "../Ontology/IAxiom";
import { IOntology } from "../Ontology/IOntology";
import { PropertyNameSelector } from "../Ontology/PropertyNameSelector";
import { annotations } from './Annotations';
import { IErrors } from './Validate';

export type Error = keyof IErrors | IAxiom

function NotHasMember(
    dataRange: DataRange,
    variable: Variable
    ): BuiltIn
{
    return function*(
        substitutions: Iterable<object>
        ): Generator<object>
    {
        for(const substitution of substitutions)
            if(!dataRange.HasMember(substitution[variable]))
                yield substitution;
    };
}

export function ObserveErrors(
    ontology        : IOntology,
    store           : IEavStore,
    applicableStages: Observable<Set<Guid>>
    ): Observable<Map<any, Map<string, Set<Error>>>>
{
    const rules: Rule[] = [];
    const interpreter = new AxiomInterpreter(
        ontology,
        store,
        rules);
    for(const axiom of ontology.Get(ontology.IsAxiom.IAxiom))
        axiom.Accept(interpreter);

    for(const dataPropertyRange of ontology.Get(ontology.IsAxiom.IDataPropertyRange))
    {
        const propertyName = dataPropertyRange.DataPropertyExpression.Select(PropertyNameSelector);
        rules.push([['PropertyError', DealStageIdentifier.Prospect, '?x', propertyName, 'Invalid'], [[dataPropertyRange.DataPropertyExpression.Select(interpreter.PropertyExpressionInterpreter), '?x', '?y'], NotHasMember(dataPropertyRange.Range, '?y')]]);
    }

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
                    propertyName = subClassOf.SuperClassExpression.PropertyExpression.Select(PropertyNameSelector);

                let errorAnnotation = annotation.Annotations.find(annotation => annotation.Property === annotations.Error);
                let error = errorAnnotation ? errorAnnotation.Value : "Mandatory";

                rules.push([['PropertyError', annotation.Value, '?x', propertyName, error], [[subClassOf.SubClassExpression.Select(interpreter.ClassExpressionInterpreter), '?x'], Not([subClassOf.SuperClassExpression.Select(interpreter.ClassExpressionInterpreter), '?x'])]]);
            }

    for(let rule of ontology.Get(IsDLSafeRule))
        for(let annotation of rule.Annotations)
            if(annotation.Property === annotations.RestrictedfromStage)
            {
                const comparison = rule.Head.find<IComparisonAtom>((atom): atom is IComparisonAtom => atom instanceof ComparisonAtom);
                const lhsProperty = rule.Head.find<IPropertyAtom>((atom): atom is IPropertyAtom => atom instanceof PropertyAtom && IsVariable(atom.Domain) && atom.Range === comparison.Lhs);

                if(comparison && lhsProperty)
                    rules.push([
                        ['PropertyError', annotation.Value, lhsProperty.Domain, lhsProperty.PropertyExpression.Select(PropertyNameSelector), rule],
                        [...rule.Body.map(atom => atom.Select(interpreter.AtomInterpreter)), Not(...rule.Head.map(atom => atom.Select(interpreter.AtomInterpreter)))]]);
            }

    let propertyErrors = store.Observe(
        ['?dealStageId', '?individual', '?propertyName', '?error'],
        [['PropertyError', '?dealStageId', '?individual', '?propertyName', '?error']],
        ...rules);

    return combineLatest(
        applicableStages,
        propertyErrors,
        (applicableStages, propertyErrors) =>
            propertyErrors.filter(([dealStageId,]) => applicableStages.has(dealStageId))
            ).pipe(debounceTime(0, asapScheduler), map(errors =>
            {
                let errorMap = new Map<any, Map<string, Set<Error>>>();
                errors.forEach(
                    ([, individual, propertyName, error]) =>
                    {
                        let individualErrors = errorMap.get(individual);
                        if(!individualErrors)
                        {
                            individualErrors = new Map<string, Set<Error>>();
                            errorMap.set(
                                individual,
                                individualErrors);
                        }

                        let propertyErrors = individualErrors.get(propertyName);
                        if(!propertyErrors)
                        {
                            propertyErrors = new Set<Error>();
                            individualErrors.set(
                                propertyName,
                                propertyErrors);
                        }

                        propertyErrors.add(error);
                    });
                return errorMap;
            }));
}

