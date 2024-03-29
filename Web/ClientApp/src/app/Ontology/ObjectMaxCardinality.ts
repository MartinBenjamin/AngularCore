import { IClassExpression } from "./IClassExpression";
import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IObjectMaxCardinality } from "./IObjectCardinality";
import { IObjectPropertyExpression } from "./IPropertyExpression";
import { ObjectCardinality } from "./ObjectCardinality";

export class ObjectMaxCardinality
    extends ObjectCardinality
    implements IObjectMaxCardinality
{
    constructor(
        objectPropertyExpression: IObjectPropertyExpression,
        cardinality             : number,
        classExpression?        : IClassExpression
        )
    {
        super(
            objectPropertyExpression,
            cardinality,
            classExpression);
    }

    Accept(
        visitor: IClassExpressionVisitor
        )
    {
        visitor.ObjectMaxCardinality(this);
    }

    Select<TResult>(
        selector: IClassExpressionSelector<TResult>
        ): TResult
    {
        return selector.ObjectMaxCardinality(this);
    }
}
