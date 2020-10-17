import { Entity } from "./Entity";
import { IClass } from "./IClass";
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IClassMembershipEvaluator } from "./IClassMembershipEvaluator";
import { IOntology } from "./IOntology";

export class Class
    extends Entity
    implements IClass
{
    constructor(
        ontology : IOntology,
        localName: string
        )
    {
        super(
            ontology,
            localName);
    }

    Accept(
        visitor: IClassExpressionVisitor
        ): void
    {
        visitor.Class(this);
    }
    Evaluate(
        evaluator : IClassMembershipEvaluator,
        individual: object
        ): boolean
    {
        return evaluator.Class(
            this,
            individual);
    }
}
