import { IClassExpression } from "./IClassExpression";
import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IObjectMinCardinality } from "./IObjectCardinality";
import { IObjectPropertyExpression } from "./IPropertyExpression";
import { ObjectCardinality } from "./ObjectCardinality";

export class ObjectMinCardinality
    extends ObjectCardinality
    implements IObjectMinCardinality
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
        visitor.ObjectMinCardinality(this);
    }

    Select<TResult>(
        selector: IClassExpressionSelector<TResult>
        ): TResult
    {
        return selector.ObjectMinCardinality(this);
    }
}
