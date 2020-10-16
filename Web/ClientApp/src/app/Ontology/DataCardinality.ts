import { DataPropertyRestriction } from "./DataPropertyRestriction";
import { IDataCardinality } from "./IDataCardinality";
import { IDataRange } from "./IDataRange";
import { IDataPropertyExpression } from "./IPropertyExpression";

export class DataCardinality
    extends DataPropertyRestriction
    implements IDataCardinality
{
    protected constructor(
        dataPropertyExpression: IDataPropertyExpression,
        public Cardinality    : number,
        public DataRange      : IDataRange
        )
    {
        super(dataPropertyExpression)
    }
}
