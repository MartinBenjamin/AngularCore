import { DataPropertyRestriction } from "./DataPropertyRestriction";
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IClassMembershipEvaluator } from "./IClassMembershipEvaluator";
import { IDataRange } from "./IDataRange";
import { IDataSomeValuesFrom } from "./IDataSomeValuesFrom";
import { IDataPropertyExpression } from "./IPropertyExpression";

export class DataSomeValuesFrom
    extends DataPropertyRestriction
    implements IDataSomeValuesFrom
{
    public constructor(
        dataPropertyExpression: IDataPropertyExpression,
        public DataRange      : IDataRange
        )
    {
        super(dataPropertyExpression)
    }

    Accept(
        visitor: IClassExpressionVisitor
        )
    {
        visitor.DataSomeValuesFrom(this);
    }

    Evaluate(
        evaluator : IClassMembershipEvaluator,
        individual: object
        ): boolean
    {
        return evaluator.DataSomeValuesFrom(
            this,
            individual);
    }
}
