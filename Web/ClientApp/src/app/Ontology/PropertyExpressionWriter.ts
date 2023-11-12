import { IDataProperty, IObjectProperty, IProperty, IInverseObjectProperty } from "./IProperty";
import { IPropertyExpressionSelector } from "./IPropertyExpressionSelector";

export class PropertyExpressionWriter implements IPropertyExpressionSelector<string>
{
    ObjectProperty(
        objectProperty: IObjectProperty
        ): string
    {
        return `ObjectProperty(${this.Property(objectProperty)})`;
    }

    DataProperty(
        dataProperty: IDataProperty
        ): string
    {
        return `DataProperty(${this.Property(dataProperty)})`;
    }

    InverseObjectProperty(
        inverseObjectProperty: IInverseObjectProperty
        ): string
    {
        return `InverseObjectPropert(${inverseObjectProperty.ObjectProperty.Select(this)})`;
    }

    private Property(
        property: IProperty
        )
    {
        return property.LocalName;
    }
}
