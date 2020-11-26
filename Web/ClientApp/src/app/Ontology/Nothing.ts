import { Class } from "./Class";
import { IClass } from "./IClass";
import { IClassMembershipEvaluator } from "./IClassMembershipEvaluator";
import { PrefixIris } from "./PrefixIris";

class Nothing
    extends Class
    implements IClass
{
    constructor()
    {
        super(
            null,
            'Nothing')
    }

    get PrefixIri(): string
    {
        return PrefixIris.owl;
    }
    
    Evaluate(
        evaluator : IClassMembershipEvaluator,
        individual: object
        ): boolean
    {
        return false;
    }
}

const instance = new Nothing();
export { instance as Nothing };
