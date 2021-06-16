import { IClassExpression } from "./IClassExpression";
import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IClassMembershipEvaluator } from "./IClassMembershipEvaluator";
import { IObjectComplementOf } from "./IObjectComplementOf";
import { IObjectIntersectionOf } from "./IObjectIntersectionOf";
import { IObjectUnionOf } from "./IObjectUnionOf";

export class ClassExpression implements IClassExpression
{
    Accept(
        visitor: IClassExpressionVisitor
        ): void
    {
        throw new Error("Method not implemented.");
    }

    Select<TResult>(
        selector: IClassExpressionSelector<TResult>
        ): TResult
    {
        throw new Error("Method not implemented.");
    }

    Evaluate(
        evaluator : IClassMembershipEvaluator,
        individual: object
        ): boolean
    {
        throw new Error("Method not implemented.");
    }

    Intersect(
        classExpression: IClassExpression
        ): IObjectIntersectionOf
    {
        return new ObjectIntersectionOf([this, classExpression]);
    }

    Union(
        classExpression: IClassExpression
        ): IObjectUnionOf
    {
        return new ObjectUnionOf([this, classExpression]);
    }

    Complement(): IObjectComplementOf
    {
        return new ObjectComplementOf(this);
    }
}

export class ObjectIntersectionOf
    extends ClassExpression
    implements IObjectIntersectionOf
{
    public constructor(
        public ClassExpressions: IClassExpression[]
        )
    {
        super();
    }

    Accept(
        visitor: IClassExpressionVisitor
        )
    {
        visitor.ObjectIntersectionOf(this);
    }

    Select<TResult>(
        selector: IClassExpressionSelector<TResult>
        ): TResult
    {
        return selector.ObjectIntersectionOf(this);
    }

    Evaluate(
        evaluator : IClassMembershipEvaluator,
        individual: object
        ): boolean
    {
        return evaluator.ObjectIntersectionOf(
            this,
            individual);
    }
}

export class ObjectUnionOf
    extends ClassExpression
    implements IObjectUnionOf
{
    public constructor(
        public ClassExpressions: IClassExpression[]
        )
    {
        super();
    }

    Accept(
        visitor: IClassExpressionVisitor
        )
    {
        visitor.ObjectUnionOf(this);
    }

    Select<TResult>(
        selector: IClassExpressionSelector<TResult>
        ): TResult
    {
        return selector.ObjectUnionOf(this);
    }
    
    Evaluate(
        evaluator : IClassMembershipEvaluator,
        individual: object
        ): boolean
    {
        return evaluator.ObjectUnionOf(
            this,
            individual);
    }
}

export class ObjectComplementOf
    extends ClassExpression
    implements IObjectComplementOf
{
    public constructor(
        public ClassExpression: IClassExpression
        )
    {
        super();
    }

    Accept(
        visitor: IClassExpressionVisitor
        )
    {
        visitor.ObjectComplementOf(this);
    }

    Select<TResult>(
        selector: IClassExpressionSelector<TResult>
        ): TResult
    {
        return selector.ObjectComplementOf(this);
    }

    Evaluate(
        evaluator : IClassMembershipEvaluator,
        individual: object
        ): boolean
    {
        return evaluator.ObjectComplementOf(
            this,
            individual);
    }
}
