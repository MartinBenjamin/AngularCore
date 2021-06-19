import { Datatype } from "./Datatype";
import { PrefixIris } from "./PrefixIris";

class XsdDatatype extends Datatype
{
    constructor(
        localName: string
        )
    {
        super(
            null,
            localName);
    }

    get PrefixIri(): string
    {
        return PrefixIris.xsd;
    }
}

class DateTime extends XsdDatatype
{
    constructor()
    {
        super("dateTime");
    }

    HasMember(
        value: any
        ): boolean
    {
        return value instanceof Date;
    }
}

class Decimal extends XsdDatatype
{
    constructor()
    {
        super("decimal");
    }

    HasMember(
        value: any
        ): boolean
    {
        return typeof value === 'number' && !isNaN(value);
    }
}

const dateTime = new DateTime();
const decimal  = new Decimal();

export { dateTime as DateTime, decimal as Decimal };
