import { Entity } from "./Entity";
import { IDataRangeSelector } from "./IDataRangeSelector";
import { IDatatype } from "./IDatatype";
import { IOntology } from "./IOntology";

export class Datatype
    extends Entity
    implements IDatatype
{
    constructor(
        ontology : IOntology,
        localName: string
        )
    {
        super(
            ontology,
            localName);
    }

    HasMember(
        value: object
        ): boolean
    {
        throw new Error("Method not implemented.");
    }

    Select<TResult>(
        selector: IDataRangeSelector<TResult>
        ): TResult
    {
        return selector.Datatype(this);
    }
}
