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

    get Iri(): string
    {
        return `${this.Ontology}.${this.LocalName}`;
    }
}
