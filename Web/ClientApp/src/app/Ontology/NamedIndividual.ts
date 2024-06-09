import { DataPropertyAssertion, ObjectPropertyAssertion } from "./Assertion";
import { Entity } from "./Entity";
import { IDataPropertyAssertion, IObjectPropertyAssertion } from "./IAssertion";
import { IIndividual } from "./IIndividual";
import { INamedIndividual, INamedIndividualSelector } from "./INamedIndividual";
import { IOntology } from "./IOntology";
import { IDataPropertyExpression, IObjectPropertyExpression } from "./IPropertyExpression";

export class NamedIndividual
    extends Entity
    implements INamedIndividual
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

    Select<TResult>(
        selector: INamedIndividualSelector<TResult>
        ): TResult
    {
        return selector.NamedIndividual(this);
    }

    ObjectPropertyValue(
        objectPropertyExpression: IObjectPropertyExpression,
        targetIndividual        : IIndividual
        ): IObjectPropertyAssertion
    {
        return new ObjectPropertyAssertion(
            this.Ontology,
            objectPropertyExpression,
            this,
            targetIndividual);
    }

    DataPropertyValue(
        dataPropertyExpression: IDataPropertyExpression,
        targetValue           : any
        ): IDataPropertyAssertion
    {
        return new DataPropertyAssertion(
            this.Ontology,
            dataPropertyExpression,
            this,
            targetValue);
    }
}
