import { IClassExpression } from "./IClassExpression";
import { IObjectPropertyRange } from "./IObjectPropertyRange";
import { IOntology } from "./IOntology";
import { IObjectPropertyExpression } from "./IPropertyExpression";
import { ObjectPropertyAxiom } from "./ObjectPropertyAxiom";

export class ObjectPropertyRange
    extends ObjectPropertyAxiom
    implements IObjectPropertyRange
{
    constructor(
        ontology                : IOntology,
        objectPropertyExpression: IObjectPropertyExpression,
        public Range            : IClassExpression
        )
    {
        super(
            ontology,
            objectPropertyExpression);
    }
}
