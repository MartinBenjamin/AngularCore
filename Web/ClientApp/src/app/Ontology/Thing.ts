import { Class } from "./Class";
import { IClass } from "./IClass";
import { IClassMembershipEvaluator } from "./IClassMembershipEvaluator";
import { ReservedVocabulary } from "./ReservedVocabulary";

export class Thing
    extends Class
    implements IClass
{
    constructor()
    {
        super(
            null,
            'Thing')
    }

    get Iri(): string
    {
        return ReservedVocabulary.StandardPrefixNames.owl + this.LocalName;
    }

    Evaluate(
        evaluator: IClassMembershipEvaluator,
        individual: object
        ): boolean
    {
        return true;
    }
}
