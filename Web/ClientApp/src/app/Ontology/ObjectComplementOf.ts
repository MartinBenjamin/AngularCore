import { IClassExpression } from "./IClassExpression";
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IClassMembershipEvaluator } from "./IClassMembershipEvaluator";
import { IObjectComplementOf } from "./IObjectComplementOf";

export class ObjectComplementOf implements IObjectComplementOf
{
    public constructor(
        public ClassExpression: IClassExpression
        )
    {
    }

    Accept(
        visitor: IClassExpressionVisitor
        )
    {
        visitor.ObjectComplementOf(this);
    }
    
    Evaluate(
        evaluator : IClassMembershipEvaluator,
        individual: object
        ): boolean
    {
        return evaluator.ObjectComplementOf(
            this,
            individual);
    }


}
