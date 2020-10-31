import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IClassMembershipEvaluator } from "./IClassMembershipEvaluator";
import { IPropertyExpression } from "./IPropertyExpression";
import { IPropertyRestriction } from "./IPropertyRestriction";

export class PropertyRestriction implements IPropertyRestriction
{
    protected constructor(
        public PropertyExpression: IPropertyExpression
        )
    {
    }

    Accept(
        visitor: IClassExpressionVisitor
        ): void
    {
        throw new Error("Method not implemented.");
    }

    Evaluate(
        evaluator : IClassMembershipEvaluator,
        individual: object
        ): boolean
    {
        throw new Error("Method not implemented.");
    }
}
