import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IClassMembershipEvaluator } from "./IClassMembershipEvaluator";
import { IObjectHasValue } from "./IObjectHasValue";
import { IObjectPropertyExpression } from "./IPropertyExpression";
import { ObjectPropertyRestriction } from "./ObjectPropertyRestriction";

export class ObjectHasValue
    extends ObjectPropertyRestriction
    implements IObjectHasValue
{
    public constructor(
        objectPropertyExpression: IObjectPropertyExpression,
        public Individual       : object
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

    Evaluate(
        evaluator: IClassMembershipEvaluator,
        individual: object
        ): boolean
    {
        return evaluator.ObjectHasValue(
            this,
            individual);
    }
}
