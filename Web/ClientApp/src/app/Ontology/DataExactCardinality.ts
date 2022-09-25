import { DataCardinality } from "./DataCardinality";
import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IDataExactCardinality } from "./IDataCardinality";
import { IDataRange } from "./IDataRange";
import { IDataPropertyExpression } from "./IPropertyExpression";

export class DataExactCardinality
    extends DataCardinality
    implements IDataExactCardinality
{
    constructor(
        dataPropertyExpression: IDataPropertyExpression,
        cardinality           : number,
        dataRange?            : IDataRange
        )
    {
        super(
            dataPropertyExpression,
            cardinality,
            dataRange);
    }

    Accept(
        visitor: IClassExpressionVisitor
        )
    {
        visitor.DataExactCardinality(this);
    }

    Select<TResult>(
        selector: IClassExpressionSelector<TResult>
        ): TResult
    {
        return selector.DataExactCardinality(this);
    }
}
