import { BuiltIn } from "./BuiltIn";
import { IClass } from "./IClass";
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IClassMembershipEvaluator } from "./IClassMembershipEvaluator";
import { ReservedVocabulary } from "./ReservedVocabulary";

export class Thing
    extends BuiltIn
    implements IClass
{
    constructor()
    {
        super(
            ReservedVocabulary.StandardPrefixNames.owl,
            'Thing')
    }

    Accept(
        visitor: IClassExpressionVisitor
        )
    {
        visitor.Class(this);
    }
    
    Evaluate(
        evaluator : IClassMembershipEvaluator,
        individual: object
        ): boolean
    {
        return true;
    }
}
