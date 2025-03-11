import { Count } from "../EavStore/Aggregation";
import { GreaterThanOrEqual } from "../EavStore/BuiltIn";
import { Rule, Variable } from "../EavStore/Datalog";
import { IClass } from "./IClass";
import { IClassExpressionSelector } from "./IClassExpressionSelector";
import { IDataAllValuesFrom } from "./IDataAllValuesFrom";
import { IDataExactCardinality, IDataMaxCardinality, IDataMinCardinality } from "./IDataCardinality";
import { IDataHasValue } from "./IDataHasValue";
import { IDataSomeValuesFrom } from "./IDataSomeValuesFrom";
import { IIndividual } from "./IIndividual";
import { IObjectAllValuesFrom } from "./IObjectAllValuesFrom";
import { IObjectCardinality, IObjectExactCardinality, IObjectMaxCardinality, IObjectMinCardinality } from "./IObjectCardinality";
import { IObjectComplementOf } from "./IObjectComplementOf";
import { IObjectHasSelf } from "./IObjectHasSelf";
import { IObjectHasValue } from "./IObjectHasValue";
import { IObjectIntersectionOf } from "./IObjectIntersectionOf";
import { IObjectOneOf } from "./IObjectOneOf";
import { IObjectSomeValuesFrom } from "./IObjectSomeValuesFrom";
import { IObjectUnionOf } from "./IObjectUnionOf";
import { IPropertyExpressionSelector } from "./IPropertyExpressionSelector";
import { PropertyExpressionInterpreter } from "./PropertyExpressionInterpreterDatalog";

export type ClassAtom = [string, any];


class PredicateSymbolGenerator implements IClassExpressionSelector<string>
{
    private _next = 0;

    ObjectIntersectionOf  (objectIntersectionOf  : IObjectIntersectionOf  ): string { return this.NextPredicateSymbol(); }
    ObjectUnionOf         (objectUnionOf         : IObjectUnionOf         ): string { return this.NextPredicateSymbol(); }
    ObjectComplementOf    (objectComplementOf    : IObjectComplementOf    ): string { return this.NextPredicateSymbol(); }
    ObjectOneOf           (objectOneOf           : IObjectOneOf           ): string { return this.NextPredicateSymbol(); }
    ObjectSomeValuesFrom  (objectSomeValuesFrom  : IObjectSomeValuesFrom  ): string { return this.NextPredicateSymbol(); }
    ObjectAllValuesFrom   (objectAllValuesFrom   : IObjectAllValuesFrom   ): string { return this.NextPredicateSymbol(); }
    ObjectHasValue        (objectHasValue        : IObjectHasValue        ): string { return this.NextPredicateSymbol(); }
    ObjectHasSelf         (objectHasSelf         : IObjectHasSelf         ): string { return this.NextPredicateSymbol(); }
    ObjectMinCardinality  (objectMinCardinality  : IObjectMinCardinality  ): string { return this.NextPredicateSymbol(); }
    ObjectMaxCardinality  (objectMaxCardinality  : IObjectMaxCardinality  ): string { return this.NextPredicateSymbol(); }
    ObjectExactCardinality(objectExactCardinality: IObjectExactCardinality): string { return this.NextPredicateSymbol(); }
    DataSomeValuesFrom    (dataSomeValuesFrom    : IDataSomeValuesFrom    ): string { return this.NextPredicateSymbol(); }
    DataAllValuesFrom     (dataAllValuesFrom     : IDataAllValuesFrom     ): string { return this.NextPredicateSymbol(); }
    DataHasValue          (dataHasValue          : IDataHasValue          ): string { return this.NextPredicateSymbol(); }
    DataMinCardinality    (dataMinCardinality    : IDataMinCardinality    ): string { return this.NextPredicateSymbol(); }
    DataMaxCardinality    (dataMaxCardinality    : IDataMaxCardinality    ): string { return this.NextPredicateSymbol(); }
    DataExactCardinality  (dataExactCardinality  : IDataExactCardinality  ): string { return this.NextPredicateSymbol(); }
    Class                 (class$                : IClass                 ): string { return class$.Iri;                 }

    private NextPredicateSymbol(): string
    {
        return "ce" + this._next++;
    }
}

export class ClassExpressionInterpreter implements IClassExpressionSelector<string>
{
    private readonly _domain: Variable = '?x';
    private readonly _range : Variable = '?y';

    private _propertyExpressionInterpreter: IPropertyExpressionSelector<string>;
    private _predicateSymbolSelector = new PredicateSymbolGenerator();

    constructor(
        private readonly _individualInterpretation: ReadonlyMap<IIndividual, any>,
        private readonly _rules: Rule[]
        )
    {
        this._propertyExpressionInterpreter = new PropertyExpressionInterpreter(this._rules);
    }

    ObjectIntersectionOf(
        objectIntersectionOf: IObjectIntersectionOf
        ): string
    {
        const predicateSymbol = objectIntersectionOf.Select(this._predicateSymbolSelector);
        this._rules.push([[predicateSymbol, '?x'], objectIntersectionOf.ClassExpressions.map(classExpression => [classExpression.Select(this), '?x'])]);
        return predicateSymbol;
    }

    ObjectUnionOf(
        objectUnionOf: IObjectUnionOf
        ): string
    {
        const predicateSymbol = objectUnionOf.Select(this._predicateSymbolSelector);
        this._rules.push(...objectUnionOf.ClassExpressions.map(classExpression => <Rule>[[predicateSymbol, '?x'], [[classExpression.Select(this), '?x']]]));
        return predicateSymbol;
    }

    ObjectComplementOf(objectComplementOf: IObjectComplementOf): string {
        throw new Error("Method not implemented.");
    }

    ObjectOneOf(
        objectOneOf: IObjectOneOf
        ): string
    {
        const predicateSymbol = objectOneOf.Select(this._predicateSymbolSelector);
        this._rules.push(...objectOneOf.Individuals.map(individual => <Rule>[[predicateSymbol, this._individualInterpretation.get(individual)], []]));
        return predicateSymbol;
    }

    ObjectSomeValuesFrom(objectSomeValuesFrom: IObjectSomeValuesFrom): string {
        throw new Error("Method not implemented.");
    }
    ObjectAllValuesFrom(objectAllValuesFrom: IObjectAllValuesFrom): string {
        throw new Error("Method not implemented.");
    }

    ObjectHasValue(
        objectHasValue: IObjectHasValue
        ): string
    {
        const predicateSymbol = objectHasValue.Select(this._predicateSymbolSelector);
        this._rules.push([[predicateSymbol, '?x'], [[objectHasValue.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter), '?x', this._individualInterpretation.get(objectHasValue.Individual)]]]);
        return predicateSymbol;
    }

    ObjectHasSelf(
        objectHasSelf: IObjectHasSelf
        ): string
    {
        const predicateSymbol = objectHasSelf.Select(this._predicateSymbolSelector);
        this._rules.push([[predicateSymbol, '?x'], [[objectHasSelf.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter), '?x', '?x']]]);
        return predicateSymbol;
    }

    ObjectMinCardinality(
        objectMinCardinality: IObjectMinCardinality
        ): string
    {
        const predicateSymbol = objectMinCardinality.Select(this._predicateSymbolSelector);
        this._rules.push([[predicateSymbol, '?x'], [[this.ObjectCardinality(objectMinCardinality), '?x', '?cardinality'], GreaterThanOrEqual('?cardinality', objectMinCardinality.Cardinality)]]);
        return predicateSymbol;
    }

    ObjectMaxCardinality(objectMaxCardinality: IObjectMaxCardinality): string {
        throw new Error("Method not implemented.");
    }

    ObjectExactCardinality(
        objectExactCardinality: IObjectExactCardinality): string
    {
        throw new Error("Method not implemented.");
    }
    DataSomeValuesFrom(dataSomeValuesFrom: IDataSomeValuesFrom): string {
        throw new Error("Method not implemented.");
    }
    DataAllValuesFrom(dataAllValuesFrom: IDataAllValuesFrom): string {
        throw new Error("Method not implemented.");
    }

    DataHasValue(
        dataHasValue: IDataHasValue
        ): string
    {
        const predicateSymbol = dataHasValue.Select(this._predicateSymbolSelector);
        this._rules.push([[predicateSymbol, '?x'], [[dataHasValue.DataPropertyExpression.Select(this._propertyExpressionInterpreter), '?x', dataHasValue.Value]]]);
        return predicateSymbol;
    }

    DataMinCardinality(dataMinCardinality: IDataMinCardinality): string {
        throw new Error("Method not implemented.");
    }
    DataMaxCardinality(dataMaxCardinality: IDataMaxCardinality): string {
        throw new Error("Method not implemented.");
    }
    DataExactCardinality(dataExactCardinality: IDataExactCardinality): string {
        throw new Error("Method not implemented.");
    }

    Class(
        class$: IClass
        ): string
    {
        return class$.Select(this._predicateSymbolSelector);
    }


    ObjectCardinality(
        objectCardinality: IObjectCardinality
        ): string
    {
        let predicateSymbol = objectCardinality.Select(this._predicateSymbolSelector) + 'Cardinality';
        let cePredicateSymbol;
        if(objectCardinality.ClassExpression)
            cePredicateSymbol = objectCardinality.ClassExpression.Select(this);

        if(cePredicateSymbol)
            predicateSymbol += cePredicateSymbol;

        const rule: Rule = [[predicateSymbol, '?x', Count()], [[objectCardinality.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter), '?x', '?y']]];
        if(cePredicateSymbol)
            rule[1].push([cePredicateSymbol, '?x']);

        this._rules.push(rule);
        return predicateSymbol;
    }
}
