import { Entity } from "./Entity";
import { IPropertyExpression } from "./IPropertyExpression";
import { IOntology } from "./IOntology";
import { INamedIndividual } from "./INamedIndividual";

type Func<T, TProperty> = (t: T) => TProperty;

function IsNamedIndividual(individual: INamedIndividual | object): individual is INamedIndividual
{
    return (individual as INamedIndividual).Ontology !== undefined;
}

export class Property<T, TProperty>
    extends Entity
    implements IPropertyExpression
{
    private _property: Func<T, Iterable<TProperty>>;

    constructor(
        ontology : IOntology,
        localName: string,
        property : Func<T, Iterable<TProperty>>
        )
    {
        super(
            ontology,
            localName);
        this._property = property;
    }

    Values(
        context   : IOntology,
        individual: object
        ): Iterable<object>
    {
        throw new Error("Method not implemented.");
    }
}
