import { IObjectPropertyRestriction } from "./IObjectPropertyRestriction";
import { IObjectPropertyExpression } from "./IPropertyExpression";
import { PropertyRestriction } from "./PropertyRestriction";

export class ObjectPropertyRestriction
    extends PropertyRestriction
    implements IObjectPropertyRestriction
{
    protected constructor(
        public ObjectPropertyExpression: IObjectPropertyExpression
        )
    {
        super(ObjectPropertyExpression);
    }
}
