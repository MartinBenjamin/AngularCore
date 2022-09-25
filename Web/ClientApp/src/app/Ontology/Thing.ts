import { Class } from "./Class";
import { IClass } from "./IClass";
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
}

const instance = new Thing();
export { instance as Thing };
