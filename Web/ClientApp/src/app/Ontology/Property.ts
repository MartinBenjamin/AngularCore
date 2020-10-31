import { DataExactCardinality } from "./DataExactCardinality";
import { DataMaxCardinality } from "./DataMaxCardinality";
import { DataMinCardinality } from "./DataMinCardinality";
import { Entity } from "./Entity";
import { IClassExpression } from "./IClassExpression";
import { IDataExactCardinality, IDataMaxCardinality, IDataMinCardinality } from "./IDataCardinality";
import { IDataRange } from "./IDataRange";
import { IObjectExactCardinality, IObjectMaxCardinality, IObjectMinCardinality } from "./IObjectCardinality";
import { IObjectHasValue } from "./IObjectHasValue";
import { IOntology } from "./IOntology";
import { IDataPropertyExpression, IObjectPropertyExpression } from "./IPropertyExpression";
import { ObjectExactCardinality } from "./ObjectExactCardinality";
import { ObjectHasValue } from "./ObjectHasValue";
import { ObjectMaxCardinality } from "./ObjectMaxCardinality";
import { ObjectMinCardinality } from "./ObjectMinCardinality";

export class ObjectProperty
    extends Entity
    implements IObjectPropertyExpression
{
    constructor(
        ontology : IOntology,
        localName: string
        )
    {
        super(
            ontology,
            localName);
    }

    HasValue(
        individual: object
        ): IObjectHasValue
    {
        return new ObjectHasValue(
            this,
            individual);
    }

    MinCardinality(
        cardinality     : number,
        classExpression?: IClassExpression
        ): IObjectMinCardinality
    {
        return new ObjectMinCardinality(
            this,
            cardinality,
            classExpression);
    }

    MaxCardinality(
        cardinality     : number,
        classExpression?: IClassExpression
        ): IObjectMaxCardinality
    {
        return new ObjectMaxCardinality(
            this,
            cardinality,
            classExpression);
    }

    ExactCardinality(
        cardinality     : number,
        classExpression?: IClassExpression
        ): IObjectExactCardinality
    {
        return new ObjectExactCardinality(
            this,
            cardinality,
            classExpression);
    }
}

export class DataProperty
    extends Entity
    implements IDataPropertyExpression
{
    constructor(
        ontology : IOntology,
        localName: string
        )
    {
        super(
            ontology,
            localName);
    }

    MinCardinality(
        cardinality: number,
        dataRange? : IDataRange
        ): IDataMinCardinality
    {
        return new DataMinCardinality(
            this,
            cardinality,
            dataRange);
    }

    MaxCardinality(
        cardinality: number,
        dataRange? : IDataRange
        ): IDataMaxCardinality
    {
        return new DataMaxCardinality(
            this,
            cardinality,
            dataRange);
    }

    ExactCardinality(
        cardinality: number,
        dataRange? : IDataRange
        ): IDataExactCardinality
    {
        return new DataExactCardinality(
            this,
            cardinality,
            dataRange);
    }
}
