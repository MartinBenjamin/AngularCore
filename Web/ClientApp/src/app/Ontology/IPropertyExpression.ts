import { IEntity } from "./IEntity";

export interface IPropertyExpression extends IEntity
{
}

export interface IObjectPropertyExpression extends IPropertyExpression
{
}

export interface IDataPropertyExpression extends IPropertyExpression
{
}
