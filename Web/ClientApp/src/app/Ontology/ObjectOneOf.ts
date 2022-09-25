import { ClassExpression } from "./ClassExpression";
import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IIndividual } from "./IIndividual";
import { IObjectOneOf } from "./IObjectOneOf";

export class ObjectOneOf
    extends ClassExpression
    implements IObjectOneOf
{
    public constructor(
        public Individuals: IIndividual[]
        )
    {
        super();
    }

    Accept(
        visitor: IClassExpressionVisitor
        )
    {
        visitor.ObjectOneOf(this);
    }

    Select<TResult>(
        selector: IClassExpressionSelector<TResult>
        ): TResult
    {
        return selector.ObjectOneOf(this);
    }
}
