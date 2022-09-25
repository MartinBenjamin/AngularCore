import { Class } from "./Class";
import { IClass } from "./IClass";
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
}

const instance = new Nothing();
export { instance as Nothing };
