import { IClassExpression } from "./IClassExpression";
import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IClassMembershipEvaluator } from "./IClassMembershipEvaluator";
import { IObjectSomeValuesFrom } from "./IObjectSomeValuesFrom";
import { IObjectPropertyExpression } from "./IPropertyExpression";
import { ObjectPropertyRestriction } from "./ObjectPropertyRestriction";

export class ObjectSomeValuesFrom
    extends ObjectPropertyRestriction
    implements IObjectSomeValuesFrom
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
        visitor.ObjectSomeValuesFrom(this);
    }

    Select<TResult>(
        selector: IClassExpressionSelector<TResult>
        ): TResult
    {
        return selector.ObjectSomeValuesFrom(this);
    }
    
    Evaluate(
        evaluator : IClassMembershipEvaluator,
        individual: object
        ): boolean
    {
        return evaluator.ObjectSomeValuesFrom(
            this,
            individual);
    }
}
