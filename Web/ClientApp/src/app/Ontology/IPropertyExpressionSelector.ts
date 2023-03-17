import { IInverseObjectProperty, IPropertySelector } from "./IProperty";

export interface IPropertyExpressionSelector<TResult> extends IPropertySelector<TResult>
{
    InverseObjectProperty(inverseObjectProperty: IInverseObjectProperty): TResult;
}
