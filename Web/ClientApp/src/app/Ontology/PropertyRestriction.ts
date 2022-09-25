import { ClassExpression } from "./ClassExpression";
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IPropertyExpression } from "./IPropertyExpression";
import { IPropertyRestriction } from "./IPropertyRestriction";

export class PropertyRestriction
    extends ClassExpression
    implements IPropertyRestriction
{
    protected constructor(
        public PropertyExpression: IPropertyExpression
        )
    {
        super();
    }

    Accept(
        visitor: IClassExpressionVisitor
        ): void
    {
        throw new Error("Method not implemented.");
    }
}
