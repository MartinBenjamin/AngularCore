import { ObjectPropertyRestriction } from "./ObjectPropertyRestriction";
import { IObjectCardinality } from "./IObjectCardinality";
import { IObjectPropertyExpression } from "./IPropertyExpression";
import { IClassExpression } from "./IClassExpression";

export class ObjectCardinality
    extends ObjectPropertyRestriction
    implements IObjectCardinality
{
    protected constructor(
        objectPropertyExpression: IObjectPropertyExpression,
        public Cardinality      : number,
        public ClassExpression  : IClassExpression
        )
    {
        super(objectPropertyExpression)
    }
}
