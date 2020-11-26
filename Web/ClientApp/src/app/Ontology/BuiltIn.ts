import { Axiom } from "./Axiom";
import { IEntity } from "./IEntity";

export class BuiltIn
    extends Axiom
    implements IEntity
{
    Iri: string;

    protected constructor(
        prefixIri       : string,
        public LocalName: string
        )
    {
        super(null);
        this.Iri = prefixIri + this.LocalName;
    }
}
