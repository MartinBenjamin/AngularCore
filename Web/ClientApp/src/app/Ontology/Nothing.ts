import { BuiltIn } from "./BuiltIn";
import { IClass } from "./IClass";
import { IClassExpressionVisitor } from "./IClassExpressionVisitor";
import { IClassMembershipEvaluator } from "./IClassMembershipEvaluator";
import { ReservedVocabulary } from "./ReservedVocabulary";

export class Nothing
    extends BuiltIn
    implements IClass
{
    constructor()
    {
        super(
            ReservedVocabulary.StandardPrefixNames.owl,
            'Nothing')
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
        return false;
    }
}
