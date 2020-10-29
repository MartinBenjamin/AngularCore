import { Entity } from "./Entity";
import { IOntology } from "./IOntology";
import { IObjectPropertyExpression } from "./IPropertyExpression";

export class ObjectProperty
    extends Entity
    implements IObjectPropertyExpression
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

export class DataProperty
    extends Entity
    implements IObjectPropertyExpression
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
