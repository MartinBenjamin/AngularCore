import { IEntity } from "./IEntity";
import { IDataPropertyExpression, IObjectPropertyExpression, IPropertyExpression } from "./IPropertyExpression";

export interface IProperty extends IEntity, IPropertyExpression
{
}

export interface IObjectProperty extends IProperty, IObjectPropertyExpression
{
}

export interface IDataProperty extends IProperty, IDataPropertyExpression
{
}
