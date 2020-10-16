import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IClassMembershipEvaluator } from "./IClassMembershipEvaluator";
import { IObjectOneOf } from "./IObjectOneOf";

export class ObjectOneOf implements IObjectOneOf
{
    public constructor(
        public Individuals: object[]
        )
    {
    }

    Accept(
        visitor: IClassExpressionVisitor
        )
    {
        visitor.ObjectOneOf(this);
    }
    
    Evaluate(
        evaluator : IClassMembershipEvaluator,
        individual: object
        ): boolean
    {
        return evaluator.ObjectOneOf(
            this,
            individual);
    }
}
