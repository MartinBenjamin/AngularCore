import { Atom, Variable } from "../EavStore/Datalog";
import { IDataProperty, IInverseObjectProperty, IObjectProperty, IProperty } from "./IProperty";
import { IPropertyExpressionSelector } from "./IPropertyExpressionSelector";

export class PropertyExpressionInterpreter implements IPropertyExpressionSelector<Atom>
{
    constructor(
        private _domain: Variable,
        private _range : Variable
        )
    {
    }

    InverseObjectProperty(
        inverseObjectProperty: IInverseObjectProperty
        ): Atom
    {
        return [inverseObjectProperty.ObjectProperty.Iri, this._range, this._domain];
    }

    ObjectProperty(
        objectProperty: IObjectProperty
        ): Atom
    {
        return this.Property(objectProperty);
    }

    DataProperty(
        dataProperty: IDataProperty
        ): Atom
    {
        return this.Property(dataProperty);
    }

    private Property(
        property: IProperty
        ): Atom
    {
        return [property.LocalName, this._domain, this._range];
    }
}
