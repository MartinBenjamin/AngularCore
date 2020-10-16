import { IClassExpression } from "./IClassExpression";
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IClassMembershipEvaluator } from "./IClassMembershipEvaluator";
import { IObjectMaxCardinality } from "./IObjectCardinality";
import { IObjectPropertyExpression } from "./IPropertyExpression";
import { ObjectCardinality } from "./ObjectCardinality";

export class ObjectMaxCardinality
    extends ObjectCardinality
    implements IObjectMaxCardinality
{
    constructor(
        objectPropertyExpression: IObjectPropertyExpression,
        cardinality             : number,
        classExpression?        : IClassExpression
        )
    {
        super(
            objectPropertyExpression,
            cardinality,
            classExpression);
    }

    Accept(
        visitor: IClassExpressionVisitor
        )
    {
        visitor.ObjectMaxCardinality(this);
    }

    Evaluate(
        evaluator : IClassMembershipEvaluator,
        individual: object
        ): boolean
    {
        return evaluator.ObjectMaxCardinality(
            this,
            individual);
    }
}
