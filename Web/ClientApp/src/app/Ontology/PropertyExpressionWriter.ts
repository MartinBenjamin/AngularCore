import { IDataProperty, IObjectProperty, IProperty } from "./IProperty";
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

    private Property(
        property: IProperty
        )
    {
        return property.LocalName;
    }
}
