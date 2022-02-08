import { IFunctionalObjectProperty } from "./IFunctionalObjectProperty";
import { IOntology } from "./IOntology";
import { IObjectPropertyExpression } from "./IPropertyExpression";
import { ObjectPropertyAxiom } from "./ObjectPropertyAxiom";

export class FunctionalObjectProperty
    extends ObjectPropertyAxiom
    implements IFunctionalObjectProperty
{
    constructor(
        ontology                : IOntology,
        objectPropertyExpression: IObjectPropertyExpression
        )
    {
        super(
            ontology,
            objectPropertyExpression);
    }
}
