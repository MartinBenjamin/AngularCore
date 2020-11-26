import { Axiom } from "./Axiom";
import { IEntity } from "./IEntity";
import { IOntology } from "./IOntology";

export class Entity
    extends Axiom
    implements IEntity
{
    protected constructor(
        ontology        : IOntology,
        public LocalName: string
        )
    {
        super(ontology);
    }

    get PrefixIri(): string
    {
        return `${this.Ontology.Iri}.`;
    }

    get Iri(): string
    {
        return `${this.PrefixIri}${this.LocalName}`;
    }
}
