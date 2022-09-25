import { DataCardinality } from "./DataCardinality";
import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IDataMinCardinality } from "./IDataCardinality";
import { IDataRange } from "./IDataRange";
import { IDataPropertyExpression } from "./IPropertyExpression";

export class DataMinCardinality
    extends DataCardinality
    implements IDataMinCardinality
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
        visitor.DataMinCardinality(this);
    }

    Select<TResult>(
        selector: IClassExpressionSelector<TResult>
        ): TResult
    {
        return selector.DataMinCardinality(this);
    }
}
