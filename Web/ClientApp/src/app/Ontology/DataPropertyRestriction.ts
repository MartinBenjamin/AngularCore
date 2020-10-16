import { IDataPropertyRestriction } from "./IDataPropertyRestriction";
import { IDataPropertyExpression } from "./IPropertyExpression";
import { PropertyRestriction } from "./PropertyRestriction";

export class DataPropertyRestriction
    extends PropertyRestriction
    implements IDataPropertyRestriction
{
    protected constructor(
        public DataPropertyExpression: IDataPropertyExpression
        )
    {
        super(DataPropertyExpression);
    }
}
