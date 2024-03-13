import { Count } from "../EavStore/Aggregation";
import { GreaterThanOrEqual } from "../EavStore/BuiltIn";
import { Rule, Variable } from "../EavStore/Datalog";
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
        const predicateSymbol = this.PredicateSymbol();
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
        const predicateSymbol = this.ObjectCardinalityPredicateSymbol(objectCardinality);
        if(!this._rules.find(([head,]) => head[0] === predicateSymbol))
        {
            const rule: Rule = [[predicateSymbol, this._propertyExpressionInterpreter.Domain, Count()], [objectCardinality.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter)]]
            if(objectCardinality.ClassExpression)
                rule[1].push(<ClassAtom>objectCardinality.ClassExpression.Select(this).map(term => term === this.Individual ? this._propertyExpressionInterpreter.Range : term));
            this._rules.push(rule);
        }

        return [predicateSymbol, this._propertyExpressionInterpreter.Domain, this._propertyExpressionInterpreter.Range];
    }

    private ObjectCardinalityPredicateSymbol(
        objectCardinality: IObjectCardinality
        ): string
    {
        return null;
    }

    private PredicateSymbol(): string
    {
        return null;
    }
}
