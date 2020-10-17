import { IClassExpression } from "./IClassExpression";
import { IObjectCardinality } from "./IObjectCardinality";
import { IObjectPropertyExpression } from "./IPropertyExpression";
import { ObjectPropertyRestriction } from "./ObjectPropertyRestriction";

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
