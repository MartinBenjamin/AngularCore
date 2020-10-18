import { Entity } from "./Entity";
import { INamedIndividual } from "./INamedIndividual";
import { IOntology } from "./IOntology";
import { IObjectPropertyExpression } from "./IPropertyExpression";

export class ObjectPropertyExpression
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

export class DataPropertyExpression
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
