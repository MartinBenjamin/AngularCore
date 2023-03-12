import { IPropertyExpressionSelector } from "./IPropertyExpressionSelector";
import { IObjectProperty, IDataProperty } from "./IProperty";

export const PropertyNameSelector: IPropertyExpressionSelector<string> = {

    ObjectProperty: (objectProperty: IObjectProperty) => objectProperty.LocalName,
    DataProperty  : (dataProperty  : IDataProperty  ) => dataProperty.LocalName
};
