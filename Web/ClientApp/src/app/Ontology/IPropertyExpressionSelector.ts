import { IDataProperty, IObjectProperty } from './IProperty';

export interface IPropertyExpressionSelector<TResult>
{
    ObjectProperty(objectProperty: IObjectProperty): TResult;
    DataProperty  (dataProperty  : IDataProperty  ): TResult;
}
