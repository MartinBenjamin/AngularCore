import { IDataProperty, IObjectProperty, IProperty, IInverseObjectProperty } from "./IProperty";
import { IPropertyExpressionSelector } from "./IPropertyExpressionSelector";

export class PropertyExpressionWriter implements IPropertyExpressionSelector<string>
{
    ObjectProperty(
        objectProperty: IObjectProperty
        ): string
    {
        return this.Property(objectProperty);
    }

    DataProperty(
        dataProperty: IDataProperty
        ): string
    {
        return this.Property(dataProperty);
    }

    InverseObjectProperty(
        inverseObjectProperty: IInverseObjectProperty
        ): string
    {
        return `ObjectInverseOf(${inverseObjectProperty.ObjectProperty.Select(this)})`;
    }

    private Property(
        property: IProperty
        )
    {
        return property.Iri;
    }
}
