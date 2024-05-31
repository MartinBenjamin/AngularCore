import { Count } from "../EavStore/Aggregation";
import { GreaterThanOrEqual } from "../EavStore/BuiltIn";
import { Rule, Variable } from "../EavStore/Datalog";
import { ICardinality } from "./ICardinality";
import { IClass } from "./IClass";
import { IClassExpression } from "./IClassExpression";
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
import { PropertyAtom, PropertyExpressionInterpreter } from "./PropertyExpressionInterpreterDatalog";

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

export class ClassExpressionInterpreter implements IClassExpressionSelector<ClassAtom>
{
    private _individualInterpretation     : ReadonlyMap<IIndividual, any>;
    private _propertyExpressionInterpreter: PropertyExpressionInterpreter;// = new PropertyExpressionInterpreter('?x', '?y');
    private _predicateSymbolSelector      : IClassExpressionSelector<string>;

    constructor(
        public readonly Individual: Variable,
        private _rules: Rule[]
        )
    {
    }

    ObjectIntersectionOf(
        objectIntersectionOf: IObjectIntersectionOf
        ): ClassAtom
    {
        throw new Error("Method not implemented.");
    }

    ObjectUnionOf(objectUnionOf: IObjectUnionOf): ClassAtom {
        throw new Error("Method not implemented.");
    }
    ObjectComplementOf(objectComplementOf: IObjectComplementOf): ClassAtom {
        throw new Error("Method not implemented.");
    }
    ObjectOneOf(objectOneOf: IObjectOneOf): ClassAtom {
        throw new Error("Method not implemented.");
    }
    ObjectSomeValuesFrom(objectSomeValuesFrom: IObjectSomeValuesFrom): ClassAtom {
        throw new Error("Method not implemented.");
    }
    ObjectAllValuesFrom(objectAllValuesFrom: IObjectAllValuesFrom): ClassAtom {
        throw new Error("Method not implemented.");
    }

    ObjectHasValue(
        objectHasValue: IObjectHasValue
        ): ClassAtom
    {
        const predicateSymbol = objectHasValue.Select(this._predicateSymbolSelector);
        this._rules.push([[predicateSymbol, this._propertyExpressionInterpreter.Domain], [<PropertyAtom>objectHasValue.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter)
            .map(term => term === this._propertyExpressionInterpreter.Range ? this._individualInterpretation.get(objectHasValue.Individual) : term)]]);
        return [predicateSymbol, this.Individual];
    }

    ObjectHasSelf(objectHasSelf: IObjectHasSelf): ClassAtom {
        throw new Error("Method not implemented.");
    }

    ObjectMinCardinality(
        objectMinCardinality: IObjectMinCardinality
        ): ClassAtom
    {
        let minCardinality: string;
        this._rules.push([[minCardinality, this._propertyExpressionInterpreter.Domain], [this.ObjectCardinality(objectMinCardinality), GreaterThanOrEqual(this._propertyExpressionInterpreter.Range, objectMinCardinality.Cardinality)]]);
        return [minCardinality, this.Individual];
    }

    ObjectMaxCardinality(objectMaxCardinality: IObjectMaxCardinality): ClassAtom {
        throw new Error("Method not implemented.");
    }

    ObjectExactCardinality(
        objectExactCardinality: IObjectExactCardinality): ClassAtom
    {
        throw new Error("Method not implemented.");
    }
    DataSomeValuesFrom(dataSomeValuesFrom: IDataSomeValuesFrom): ClassAtom {
        throw new Error("Method not implemented.");
    }
    DataAllValuesFrom(dataAllValuesFrom: IDataAllValuesFrom): ClassAtom {
        throw new Error("Method not implemented.");
    }

    DataHasValue(
        dataHasValue: IDataHasValue
        ): ClassAtom
    {
        return <ClassAtom>dataHasValue.DataPropertyExpression.Select(this._propertyExpressionInterpreter)
            .map(term => term === '?y' ? this._individualInterpretation.get(dataHasValue.Value) : term);
    }

    DataMinCardinality(dataMinCardinality: IDataMinCardinality): ClassAtom {
        throw new Error("Method not implemented.");
    }
    DataMaxCardinality(dataMaxCardinality: IDataMaxCardinality): ClassAtom {
        throw new Error("Method not implemented.");
    }
    DataExactCardinality(dataExactCardinality: IDataExactCardinality): ClassAtom {
        throw new Error("Method not implemented.");
    }
    Class(class$: IClass): ClassAtom {
        throw new Error("Method not implemented.");
    }


    ObjectCardinality(
        objectCardinality: IObjectCardinality
        ): PropertyAtom
    {
        const predicateSymbol = objectCardinality.Select(this._predicateSymbolSelector) + "Multiplicity";
        if(!this._rules.find(([head,]) => head[0] === predicateSymbol))
        {
            const rule: Rule = [[predicateSymbol, this._propertyExpressionInterpreter.Domain, Count()], [objectCardinality.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter)]]
            if(objectCardinality.ClassExpression)
                rule[1].push(<ClassAtom>objectCardinality.ClassExpression.Select(this).map(term => term === this.Individual ? this._propertyExpressionInterpreter.Range : term));
            this._rules.push(rule);
        }

        return [predicateSymbol, this._propertyExpressionInterpreter.Domain, this._propertyExpressionInterpreter.Range];
    }
}
