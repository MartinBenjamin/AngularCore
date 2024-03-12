import { Idb, Variable } from "../EavStore/Datalog";
import { IDataProperty, IInverseObjectProperty, IObjectProperty, IProperty } from "./IProperty";
import { IPropertyExpressionSelector } from "./IPropertyExpressionSelector";

export class PropertyExpressionInterpreter implements IPropertyExpressionSelector<Idb>
{
    constructor(
        private _domain: Variable,
        private _range : Variable
        )
    {
    }

    InverseObjectProperty(
        inverseObjectProperty: IInverseObjectProperty
        ): Idb
    {
        return [inverseObjectProperty.ObjectProperty.Iri, this._range, this._domain];
    }

    ObjectProperty(
        objectProperty: IObjectProperty
        ): Idb
    {
        return this.Property(objectProperty);
    }

    DataProperty(
        dataProperty: IDataProperty
        ): Idb
    {
        return this.Property(dataProperty);
    }

    private Property(
        property: IProperty
        ): Idb
    {
        return [property.Iri, this._domain, this._range];
    }
}
