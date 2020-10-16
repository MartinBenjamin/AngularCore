import { IClassExpression } from "./IClassExpression";
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IClassMembershipEvaluator } from "./IClassMembershipEvaluator";
import { IObjectAllValuesFrom } from "./IObjectAllValuesFrom";
import { IObjectPropertyExpression } from "./IPropertyExpression";
import { ObjectPropertyRestriction } from "./ObjectPropertyRestriction";

export class ObjectAllValuesFrom
    extends ObjectPropertyRestriction
    implements IObjectAllValuesFrom
{
    public constructor(
        objectPropertyExpression: IObjectPropertyExpression,
        public ClassExpression  : IClassExpression
        )
    {
        super(objectPropertyExpression)
    }

    Accept(
        visitor: IClassExpressionVisitor
        )
    {
        visitor.ObjectAllValuesFrom(this);
    }
    
    Evaluate(
        evaluator : IClassMembershipEvaluator,
        individual: object
        ): boolean
    {
        return evaluator.ObjectAllValuesFrom(
            this,
            individual);
    }
}
