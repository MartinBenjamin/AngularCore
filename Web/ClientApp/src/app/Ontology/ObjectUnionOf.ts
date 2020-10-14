import { IClassExpression } from "./IClassExpression";
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IClassMembershipEvaluator } from "./IClassMembershipEvaluator";
import { IObjectUnionOf } from "./IObjectUnionOf";

export class ObjectUnionOf implements IObjectUnionOf
{
    public constructor(
        public ClassExpressions: IClassExpression[]
        )
    {
    }

    Accept(
        visitor: IClassExpressionVisitor
        )
    {
        visitor.ObjectUnionOf(this);
    }
    
    Evaluate(
        evaluator : IClassMembershipEvaluator,
        individual: object
        ): boolean
    {
        return evaluator.ObjectUnionOf(
            this,
            individual);
    }
}
