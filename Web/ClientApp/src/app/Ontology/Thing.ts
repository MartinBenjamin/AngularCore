import { Class } from "./Class";
import { IClass } from "./IClass";
import { IClassMembershipEvaluator } from "./IClassMembershipEvaluator";
import { PrefixIris } from "./PrefixIris";

class Thing
    extends Class
    implements IClass
{
    constructor()
    {
        super(
            null,
            'Thing')
    }

    get PrefixIri(): string
    {
        return PrefixIris.owl;
    }

    Evaluate(
        evaluator: IClassMembershipEvaluator,
        individual: object
        ): boolean
    {
        return true;
    }
}

const instance = new Thing();
export { instance as Thing };
