import { IDataProperty, IInverseObjectProperty, IObjectProperty } from "./IProperty";
import { IPropertyExpressionSelector } from "./IPropertyExpressionSelector";

export const PropertyNameSelector: IPropertyExpressionSelector<string> = {

    ObjectProperty       : (objectProperty       : IObjectProperty       ) => objectProperty.LocalName,
    DataProperty         : (dataProperty         : IDataProperty         ) => dataProperty.LocalName,
    InverseObjectProperty: (inverseObjectProperty: IInverseObjectProperty) => undefined
};
