import { BuiltIn } from "./BuiltIn";
import { IDatatype } from "./IDatatype";
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

let dateTime = new DateTime();
let decimal  = new Decimal();

export { dateTime as DateTime, decimal as Decimal };
