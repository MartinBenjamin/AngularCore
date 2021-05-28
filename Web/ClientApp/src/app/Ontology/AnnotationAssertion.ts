import { Axiom } from "./Axiom";
import { IAnnotationAssertion } from "./IAnnotationAssertion";
import { IAnnotationProperty } from "./IAnnotationProperty";
import { IEntity } from "./IEntity";
import { IOntology } from "./IOntology";

export class AnnotationAssertion
    extends Axiom
    implements IAnnotationAssertion
{
    constructor(
        ontology       : IOntology,
        public Subject : IEntity,
        public Property: IAnnotationProperty,
        public Value   : any
        )
    {
        super(ontology);
    }
}
