import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IClassMembershipEvaluator } from "./IClassMembershipEvaluator";

export interface IClassExpression
{

    Accept(visitor: IClassExpressionVisitor): void;

    Evaluate(
        evaluator : IClassMembershipEvaluator,
        individual: object): boolean;
}
