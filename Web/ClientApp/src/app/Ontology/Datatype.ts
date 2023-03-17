import { Entity } from "./Entity";
import { IDatatype, IDatatypeSelector } from "./IDatatype";
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
        selector: IDatatypeSelector<TResult>
        ): TResult
    {
        return selector.Datatype(this);
    }
}
