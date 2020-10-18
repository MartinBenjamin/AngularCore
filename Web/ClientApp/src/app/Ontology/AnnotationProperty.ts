import { Entity } from "./Entity";
import { IAnnotationProperty } from "./IAnnotationProperty";
import { IOntology } from "./IOntology";

export class AnnotationProperty
    extends Entity
    implements IAnnotationProperty
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
}
