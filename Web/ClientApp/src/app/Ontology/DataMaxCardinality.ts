import { DataCardinality } from "./DataCardinality";
import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IDataMaxCardinality } from "./IDataCardinality";
import { IDataRange } from "./IDataRange";
import { IDataPropertyExpression } from "./IPropertyExpression";

export class DataMaxCardinality
    extends DataCardinality
    implements IDataMaxCardinality
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
        visitor.DataMaxCardinality(this);
    }

    Select<TResult>(
        selector: IClassExpressionSelector<TResult>
        ): TResult
    {
        return selector.DataMaxCardinality(this);
    }
}
