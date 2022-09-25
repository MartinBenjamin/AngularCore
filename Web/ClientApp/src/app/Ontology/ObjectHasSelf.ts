import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IObjectHasSelf } from "./IObjectHasSelf";
import { IObjectPropertyExpression } from "./IPropertyExpression";
import { ObjectPropertyRestriction } from "./ObjectPropertyRestriction";

export class ObjectHasSelf
    extends ObjectPropertyRestriction
    implements IObjectHasSelf
{
    public constructor(
        objectPropertyExpression: IObjectPropertyExpression
        )
    {
        super(objectPropertyExpression)
    }

    Accept(
        visitor: IClassExpressionVisitor
        )
    {
        visitor.ObjectHasSelf(this);
    }

    Select<TResult>(
        selector: IClassExpressionSelector<TResult>
        ): TResult
    {
        return selector.ObjectHasSelf(this);
    }
}
