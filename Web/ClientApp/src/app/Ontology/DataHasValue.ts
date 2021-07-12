import { DataPropertyRestriction } from "./DataPropertyRestriction";
import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IClassMembershipEvaluator } from "./IClassMembershipEvaluator";
import { IDataHasValue } from "./IDataHasValue";
import { IDataPropertyExpression } from "./IPropertyExpression";

export class DataHasValue
    extends DataPropertyRestriction
    implements IDataHasValue
{
    public constructor(
        dataPropertyExpression: IDataPropertyExpression,
        public Value          : any
        )
    {
        super(dataPropertyExpression)
    }

    Accept(
        visitor: IClassExpressionVisitor
        )
    {
        visitor.DataHasValue(this);
    }

    Select<TResult>(
        selector: IClassExpressionSelector<TResult>
        ): TResult
    {
        return selector.DataHasValue(this);
    }

    Evaluate(
        evaluator : IClassMembershipEvaluator,
        individual: object
        ): boolean
    {
        return evaluator.DataHasValue(
            this,
            individual);
    }
}
