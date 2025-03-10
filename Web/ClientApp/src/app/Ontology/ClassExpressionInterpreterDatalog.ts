import { Count } from "../EavStore/Aggregation";
import { GreaterThanOrEqual } from "../EavStore/BuiltIn";
import { Idb, Rule, Variable } from "../EavStore/Datalog";
import { ICardinality } from "./ICardinality";
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

export class ClassExpressionInterpreter implements IClassExpressionSelector<Idb>
{
    private readonly _domain: Variable = '?x';
    private readonly _range : Variable = '?y';

    private _propertyExpressionInterpreter: IPropertyExpressionSelector<Idb> = new PropertyExpressionInterpreter(
            this._domain,
            this._range);
    private _predicateSymbolSelector = new PredicateSymbolGenerator();

    constructor(
        public readonly Individual: Variable,
        private readonly _individualInterpretation: ReadonlyMap<IIndividual, any>,
        private readonly _rules: Rule[]
        )
    {
    }

    ObjectIntersectionOf(
        objectIntersectionOf: IObjectIntersectionOf
        ): Idb
    {
        throw new Error("Method not implemented.");
    }

    ObjectUnionOf(objectUnionOf: IObjectUnionOf): Idb {
        throw new Error("Method not implemented.");
    }
    ObjectComplementOf(objectComplementOf: IObjectComplementOf): Idb {
        throw new Error("Method not implemented.");
    }
    ObjectOneOf(objectOneOf: IObjectOneOf): Idb {
        throw new Error("Method not implemented.");
    }
    ObjectSomeValuesFrom(objectSomeValuesFrom: IObjectSomeValuesFrom): Idb {
        throw new Error("Method not implemented.");
    }
    ObjectAllValuesFrom(objectAllValuesFrom: IObjectAllValuesFrom): Idb {
        throw new Error("Method not implemented.");
    }

    ObjectHasValue(
        objectHasValue: IObjectHasValue
        ): Idb
    {
        return <Idb>objectHasValue.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter)
            .map(term => term === this._range ? this._individualInterpretation.get(objectHasValue.Individual) : term);
    }

    ObjectHasSelf(objectHasSelf: IObjectHasSelf): Idb {
        throw new Error("Method not implemented.");
    }

    ObjectMinCardinality(
        objectMinCardinality: IObjectMinCardinality
        ): Idb
    {
        const predicateSymbol = objectMinCardinality.Select(this._predicateSymbolSelector);
        this._rules.push([[predicateSymbol, this._domain], [this.ObjectCardinality(objectMinCardinality), GreaterThanOrEqual(this._range, objectMinCardinality.Cardinality)]]);
        return [predicateSymbol, this.Individual];
    }

    ObjectMaxCardinality(objectMaxCardinality: IObjectMaxCardinality): Idb {
        throw new Error("Method not implemented.");
    }

    ObjectExactCardinality(
        objectExactCardinality: IObjectExactCardinality): Idb
    {
        throw new Error("Method not implemented.");
    }
    DataSomeValuesFrom(dataSomeValuesFrom: IDataSomeValuesFrom): Idb {
        throw new Error("Method not implemented.");
    }
    DataAllValuesFrom(dataAllValuesFrom: IDataAllValuesFrom): Idb {
        throw new Error("Method not implemented.");
    }

    DataHasValue(
        dataHasValue: IDataHasValue
        ): Idb
    {
        return <Idb>dataHasValue.DataPropertyExpression.Select(this._propertyExpressionInterpreter)
            .map(term => term === this._range ? dataHasValue.Value : term);
    }

    DataMinCardinality(dataMinCardinality: IDataMinCardinality): Idb {
        throw new Error("Method not implemented.");
    }
    DataMaxCardinality(dataMaxCardinality: IDataMaxCardinality): Idb {
        throw new Error("Method not implemented.");
    }
    DataExactCardinality(dataExactCardinality: IDataExactCardinality): Idb {
        throw new Error("Method not implemented.");
    }

    Class(
        class$: IClass
        ): Idb
    {
        return [class$.Iri, this.Individual];
    }


    ObjectCardinality(
        objectCardinality: IObjectCardinality
        ): Idb
    {
        const predicateSymbol = objectCardinality.Select(this._predicateSymbolSelector);
        const rule: Rule = [[predicateSymbol, this._domain, Count()], [objectCardinality.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter)]]
        if(objectCardinality.ClassExpression)
            rule[1].push(<Idb>objectCardinality.ClassExpression.Select(this).map(term => term === this.Individual ? this._range : term));
        this._rules.push(rule);
        return [predicateSymbol, this._domain, this._range];
    }
}
