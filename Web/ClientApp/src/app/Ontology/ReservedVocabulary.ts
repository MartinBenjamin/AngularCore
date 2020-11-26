import { BuiltIn } from "./BuiltIn";
import { IDatatype } from "./IDatatype";
import { Nothing } from "./Nothing";
import { Thing } from "./Thing";
import { PrefixIris } from "./PrefixIris";

class DateTime
    extends BuiltIn
    implements IDatatype
{
    constructor()
    {
        super(
            PrefixIris.xsd,
            "dateTime");
    }

    HasMember(
        value: any
        ): boolean
    {
        return value instanceof Date;
    }
}

class Decimal
    extends BuiltIn
    implements IDatatype
{
    constructor()
    {
        super(
            PrefixIris.xsd,
            "decimal");
    }

    HasMember(
        value: any
        ): boolean
    {
        return typeof value === 'number' && !isNaN(value);
    }
}

let ReservedVocabulary =
{
    Thing  : Thing,
    Nothing: Nothing,
    Xsd    :
    {
        DateTime: new DateTime(),
        Decimal : new Decimal()
    }
};

export { ReservedVocabulary };
