import { IDataProperty, IInverseObjectProperty, IObjectProperty } from './IProperty';

export interface IPropertyExpressionSelector<TResult>
{
    ObjectProperty       (objectProperty       : IObjectProperty       ): TResult;
    DataProperty         (dataProperty         : IDataProperty         ): TResult;
    InverseObjectProperty(inverseObjectProperty: IInverseObjectProperty): TResult;
}
