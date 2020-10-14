import { IClassExpression } from "./IClassExpression";
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IClassMembershipEvaluator } from "./IClassMembershipEvaluator";
import { IObjectIntersectionOf } from "./IObjectIntersectionOf";

export class ObjectIntersectionOf implements IObjectIntersectionOf
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
        visitor.ObjectIntersectionOf(this);
    }
    
    Evaluate(
        evaluator : IClassMembershipEvaluator,
        individual: object
        ): boolean
    {
        return evaluator.ObjectIntersectionOf(
            this,
            individual);
    }
}
