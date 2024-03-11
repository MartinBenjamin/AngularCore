import { DataExactCardinality } from "./DataExactCardinality";
import { DataHasValue } from "./DataHasValue";
import { DataMaxCardinality } from "./DataMaxCardinality";
import { DataMinCardinality } from "./DataMinCardinality";
import { DataPropertyRange } from "./DataPropertyRange";
import { Entity } from "./Entity";
import { IClassExpression } from "./IClassExpression";
import { IDataExactCardinality, IDataMaxCardinality, IDataMinCardinality } from "./IDataCardinality";
import { IDataHasValue } from "./IDataHasValue";
import { IDataPropertyRange } from "./IDataPropertyRange";
import { IDataRange } from "./IDataRange";
import { IIndividual } from "./IIndividual";
import { IObjectExactCardinality, IObjectMaxCardinality, IObjectMinCardinality } from "./IObjectCardinality";
import { IObjectHasValue } from "./IObjectHasValue";
import { IOntology } from "./IOntology";
import { IDataProperty, IDataPropertySelector, IDataPropertyVisitor, IInverseObjectProperty, IObjectProperty, IObjectPropertySelector, IObjectPropertyVisitor } from "./IProperty";
import { IPropertyExpressionSelector } from "./IPropertyExpressionSelector";
import { ObjectExactCardinality } from "./ObjectExactCardinality";
import { ObjectHasValue } from "./ObjectHasValue";
import { ObjectMaxCardinality } from "./ObjectMaxCardinality";
import { ObjectMinCardinality } from "./ObjectMinCardinality";

export class ObjectProperty
    extends Entity
    implements IObjectProperty
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

    Accept(
        visitor: IObjectPropertyVisitor
        )
    {
        visitor.ObjectProperty(this);
    }

    Select<TResult>(
        selector: IObjectPropertySelector<TResult>
        ): TResult
    {
        return selector.ObjectProperty(this);
    }

    HasValue(
        individual: IIndividual
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
    implements IDataProperty
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

    Accept(
        visitor: IDataPropertyVisitor
        )
    {
        visitor.DataProperty(this);
    }

    Select<TResult>(
        selector: IDataPropertySelector<TResult>
        ): TResult
    {
        return selector.DataProperty(this);
    }

    HasValue(
        value: any
        ): IDataHasValue
    {
        return new DataHasValue(
            this,
            value);
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

    Range(
        dataRange: IDataRange
        ): IDataPropertyRange
    {
        return new DataPropertyRange(
            this.Ontology,
            this,
            dataRange);
    }
}

export class InverseObjectProperty implements IInverseObjectProperty
{
    constructor(
        public ObjectProperty: IObjectProperty
        )
    {
    }

    Select<TResult>(
        selector: IPropertyExpressionSelector<TResult>
        ): TResult
    {
        return selector.InverseObjectProperty(this);
    }

    HasValue(
        individual: IIndividual
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
