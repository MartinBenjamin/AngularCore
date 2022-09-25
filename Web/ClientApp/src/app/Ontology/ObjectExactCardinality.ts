import { IClassExpression } from "./IClassExpression";
import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IObjectExactCardinality } from "./IObjectCardinality";
import { IObjectPropertyExpression } from "./IPropertyExpression";
import { ObjectCardinality } from "./ObjectCardinality";

export class ObjectExactCardinality
    extends ObjectCardinality
    implements IObjectExactCardinality
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
        visitor.ObjectExactCardinality(this);
    }

    Select<TResult>(
        selector: IClassExpressionSelector<TResult>
        ): TResult
    {
        return selector.ObjectExactCardinality(this);
    }
}
