import { DataPropertyRestriction } from "./DataPropertyRestriction";
import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
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

    Select<TResult>(
        selector: IClassExpressionSelector<TResult>
        ): TResult
    {
        return selector.DataSomeValuesFrom(this);
    }
}
