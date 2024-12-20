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
    private _propertyPredicateSymbolGenerator: IPropertyExpressionSelector<string>;
    private _next = 0;

    ObjectIntersectionOf  (objectIntersectionOf  : IObjectIntersectionOf  ): string { return this.NextPredicateSymbol("ObjectIntersectionOf"    ); }
    ObjectUnionOf         (objectUnionOf         : IObjectUnionOf         ): string { return this.NextPredicateSymbol("ObjectUnionOf"           ); }
    ObjectComplementOf    (objectComplementOf    : IObjectComplementOf    ): string { return this.NextPredicateSymbol("ObjectComplementOf"      ); }
    ObjectOneOf           (objectOneOf           : IObjectOneOf           ): string { return this.NextPredicateSymbol("ObjectOneOf"             ); }
    ObjectSomeValuesFrom  (objectSomeValuesFrom  : IObjectSomeValuesFrom  ): string { return this.NextPredicateSymbol("ObjectSomeValuesFrom"    ); }
    ObjectAllValuesFrom   (objectAllValuesFrom   : IObjectAllValuesFrom   ): string { return this.NextPredicateSymbol("ObjectAllValuesFrom"     ); }
    ObjectHasValue        (objectHasValue        : IObjectHasValue        ): string { return this.NextPredicateSymbol("ObjectHasValue"          ); }
    ObjectHasSelf         (objectHasSelf         : IObjectHasSelf         ): string { return this.NextPredicateSymbol("ObjectHasSelf"           ); }
    ObjectMinCardinality  (objectMinCardinality  : IObjectMinCardinality  ): string { return objectMinCardinality.ClassExpression   ? this.NextPredicateSymbol("ObjectMinCardinality"  ) : "ObjectMinCardinality"   +  this.Cardinality(objectMinCardinality  ); }
    ObjectMaxCardinality  (objectMaxCardinality  : IObjectMaxCardinality  ): string { return objectMaxCardinality.ClassExpression   ? this.NextPredicateSymbol("ObjectMaxCardinality"  ) : "ObjectMaxCardinality"   +  this.Cardinality(objectMaxCardinality  ); }
    ObjectExactCardinality(objectExactCardinality: IObjectExactCardinality): string { return objectExactCardinality.ClassExpression ? this.NextPredicateSymbol("ObjectExactCardinality") : "ObjectExactCardinality" +  this.Cardinality(objectExactCardinality); }
    DataSomeValuesFrom    (dataSomeValuesFrom    : IDataSomeValuesFrom    ): string { return this.NextPredicateSymbol("DataSomeValuesFrom"      ); }
    DataAllValuesFrom     (dataAllValuesFrom     : IDataAllValuesFrom     ): string { return this.NextPredicateSymbol("DataAllValuesFrom"       ); }
    DataHasValue          (dataHasValue          : IDataHasValue          ): string { return this.NextPredicateSymbol("DataHasValue"            ); }
    DataMinCardinality    (dataMinCardinality    : IDataMinCardinality    ): string { return dataMinCardinality.DataRange   ? this.NextPredicateSymbol("ObjectMinCardinality"  ) : "ObjectMinCardinality"   +  this.Cardinality(dataMinCardinality  ); }
    DataMaxCardinality    (dataMaxCardinality    : IDataMaxCardinality    ): string { return dataMaxCardinality.DataRange   ? this.NextPredicateSymbol("ObjectMaxCardinality"  ) : "ObjectMaxCardinality"   +  this.Cardinality(dataMaxCardinality  ); }
    DataExactCardinality  (dataExactCardinality  : IDataExactCardinality  ): string { return dataExactCardinality.DataRange ? this.NextPredicateSymbol("ObjectExactCardinality") : "ObjectExactCardinality" +  this.Cardinality(dataExactCardinality); }
    Class                 (class$                : IClass                 ): string { return class$.Iri;                                           }

    Cardinality(
        cardinality: ICardinality
        ): string
    {
        return cardinality.Cardinality + cardinality.PropertyExpression.Select(this._propertyPredicateSymbolGenerator);
    }

    private NextPredicateSymbol(
        expressionType: string
        ): string
    {
        return expressionType + this._next++;
    }
}

export class ClassExpressionInterpreter implements IClassExpressionSelector<Idb>
{
    private readonly _domain: Variable = '?x';
    private readonly _range : Variable = '?y';

    private _propertyExpressionInterpreter: IPropertyExpressionSelector<Idb>;
    private _predicateSymbolSelector      : IClassExpressionSelector<string>;

    constructor(
        public readonly Individual: Variable,
        private readonly _individualInterpretation: ReadonlyMap<IIndividual, any>,
        private readonly _rules: Rule[]
        )
{
        this._propertyExpressionInterpreter = new PropertyExpressionInterpreter(
            this._domain,
            this._range,
            _rules);
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
        let idb = objectHasValue.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter);
        idb[this._range] = this._individualInterpretation.get(objectHasValue.Individual);
        return idb;
    }

    ObjectHasSelf(objectHasSelf: IObjectHasSelf): Idb {
        throw new Error("Method not implemented.");
    }

    ObjectMinCardinality(
        objectMinCardinality: IObjectMinCardinality
        ): Idb
    {
        let minCardinality: string;
        this._rules.push([[minCardinality, this._domain], [this.ObjectCardinality(objectMinCardinality), GreaterThanOrEqual(this._range, objectMinCardinality.Cardinality)]]);
        return [minCardinality, this.Individual];
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
        let idb = dataHasValue.DataPropertyExpression.Select(this._propertyExpressionInterpreter);
        idb[this._range] = dataHasValue.Value;
        return idb;
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
        const predicateSymbol = objectCardinality.Select(this._predicateSymbolSelector) + "Multiplicity";
        if(!this._rules.find(([head,]) => head[0] === predicateSymbol))
        {
            const rule: Rule = [[predicateSymbol, this._domain, Count()], [objectCardinality.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter)]]
            if(objectCardinality.ClassExpression)
            {
                let classExpressionIdb = objectCardinality.ClassExpression.Select(this);
                classExpressionIdb[this.Individual] = this._range;
                rule[1].push(classExpressionIdb);
            }
            this._rules.push(rule);
        }

        return [predicateSymbol, this._domain, this._range];
    }
}
