import { Atom, Idb } from "../EavStore/Datalog";
import { IClass } from "./IClass";
import { IClassExpressionSelector } from "./IClassExpressionSelector";
import { IDataAllValuesFrom } from "./IDataAllValuesFrom";
import { IDataExactCardinality, IDataMaxCardinality, IDataMinCardinality } from "./IDataCardinality";
import { IDataHasValue } from "./IDataHasValue";
import { IDataSomeValuesFrom } from "./IDataSomeValuesFrom";
import { IIndividual } from "./IIndividual";
import { IObjectAllValuesFrom } from "./IObjectAllValuesFrom";
import { IObjectExactCardinality, IObjectMaxCardinality, IObjectMinCardinality } from "./IObjectCardinality";
import { IObjectComplementOf } from "./IObjectComplementOf";
import { IObjectHasSelf } from "./IObjectHasSelf";
import { IObjectHasValue } from "./IObjectHasValue";
import { IObjectIntersectionOf } from "./IObjectIntersectionOf";
import { IObjectOneOf } from "./IObjectOneOf";
import { IObjectSomeValuesFrom } from "./IObjectSomeValuesFrom";
import { IObjectUnionOf } from "./IObjectUnionOf";
import { IPropertyExpressionSelector } from "./IPropertyExpressionSelector";
import { PropertyExpressionInterpreter } from "./PropertyExpressionInterpreterDatalog";

export class ClassExpressionInterpreter implements IClassExpressionSelector<Atom[]>
{
    private _individualInterpretation     : ReadonlyMap<IIndividual, any>;
    private _propertyExpressionInterpreter: IPropertyExpressionSelector<Idb> = new PropertyExpressionInterpreter('?x', '?y')

    ObjectIntersectionOf(
        objectIntersectionOf: IObjectIntersectionOf
        ): Atom[]
    {
        throw new Error("Method not implemented.");
    }

    ObjectUnionOf(objectUnionOf: IObjectUnionOf): Atom[] {
        throw new Error("Method not implemented.");
    }
    ObjectComplementOf(objectComplementOf: IObjectComplementOf): Atom[] {
        throw new Error("Method not implemented.");
    }
    ObjectOneOf(objectOneOf: IObjectOneOf): Atom[] {
        throw new Error("Method not implemented.");
    }
    ObjectSomeValuesFrom(objectSomeValuesFrom: IObjectSomeValuesFrom): Atom[] {
        throw new Error("Method not implemented.");
    }
    ObjectAllValuesFrom(objectAllValuesFrom: IObjectAllValuesFrom): Atom[] {
        throw new Error("Method not implemented.");
    }

    ObjectHasValue(
        objectHasValue: IObjectHasValue
        ): Atom[]
    {
        return [<Idb>objectHasValue.ObjectPropertyExpression.Select(this._propertyExpressionInterpreter)
            .map(term => term === '?y' ? this._individualInterpretation.get(objectHasValue.Individual) : term)];
    }

    ObjectHasSelf(objectHasSelf: IObjectHasSelf): Atom[] {
        throw new Error("Method not implemented.");
    }
    ObjectMinCardinality(objectMinCardinality: IObjectMinCardinality): Atom[] {
        throw new Error("Method not implemented.");
    }
    ObjectMaxCardinality(objectMaxCardinality: IObjectMaxCardinality): Atom[] {
        throw new Error("Method not implemented.");
    }
    ObjectExactCardinality(objectExactCardinality: IObjectExactCardinality): Atom[] {
        throw new Error("Method not implemented.");
    }
    DataSomeValuesFrom(dataSomeValuesFrom: IDataSomeValuesFrom): Atom[] {
        throw new Error("Method not implemented.");
    }
    DataAllValuesFrom(dataAllValuesFrom: IDataAllValuesFrom): Atom[] {
        throw new Error("Method not implemented.");
    }

    DataHasValue(
        dataHasValue: IDataHasValue
        ): Atom[]
    {
        return [<Idb>dataHasValue.DataPropertyExpression.Select(this._propertyExpressionInterpreter)
            .map(term => term === '?y' ? this._individualInterpretation.get(dataHasValue.Value) : term)];
    }

    DataMinCardinality(dataMinCardinality: IDataMinCardinality): Atom[] {
        throw new Error("Method not implemented.");
    }
    DataMaxCardinality(dataMaxCardinality: IDataMaxCardinality): Atom[] {
        throw new Error("Method not implemented.");
    }
    DataExactCardinality(dataExactCardinality: IDataExactCardinality): Atom[] {
        throw new Error("Method not implemented.");
    }
    Class(class$: IClass): Atom[] {
        throw new Error("Method not implemented.");
    }
}
