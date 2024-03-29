import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IIndividual } from './IIndividual';
import { IObjectHasValue } from "./IObjectHasValue";
import { IObjectPropertyExpression } from "./IPropertyExpression";
import { ObjectPropertyRestriction } from "./ObjectPropertyRestriction";

export class ObjectHasValue
    extends ObjectPropertyRestriction
    implements IObjectHasValue
{
    public constructor(
        objectPropertyExpression: IObjectPropertyExpression,
        public Individual       : IIndividual
        )
    {
        super(objectPropertyExpression)
    }

    Accept(
        visitor: IClassExpressionVisitor
        )
    {
        visitor.ObjectHasValue(this);
    }

    Select<TResult>(
        selector: IClassExpressionSelector<TResult>
        ): TResult
    {
        return selector.ObjectHasValue(this);
    }
}
