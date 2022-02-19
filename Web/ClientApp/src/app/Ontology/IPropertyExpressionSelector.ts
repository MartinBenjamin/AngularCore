import { IDataPropertyExpression, IObjectPropertyExpression } from './IPropertyExpression';

export interface IPropertyExpressionSelector<TResult>
{
    ObjectPropertyExpression(objectPropertyExpression: IObjectPropertyExpression): TResult;
    DataPropertyExpression  (dataPropertyExpression  : IDataPropertyExpression  ): TResult;
}
