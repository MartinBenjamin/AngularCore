import { DataPropertyRestriction } from "./DataPropertyRestriction";
import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IDataAllValuesFrom } from "./IDataAllValuesFrom";
import { IDataRange } from "./IDataRange";
import { IDataPropertyExpression } from "./IPropertyExpression";

export class DataAllValuesFrom
    extends DataPropertyRestriction
    implements IDataAllValuesFrom
{
    constructor(
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
        visitor.DataAllValuesFrom(this);
    }

    Select<TResult>(
        selector: IClassExpressionSelector<TResult>
        ): TResult
    {
        return selector.DataAllValuesFrom(this);
    }
}
