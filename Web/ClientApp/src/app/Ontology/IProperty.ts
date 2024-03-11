import { IEntity } from "./IEntity";
import { IDataPropertyExpression, IObjectPropertyExpression, IPropertyExpression } from "./IPropertyExpression";

export interface IObjectPropertyVisitor
{
    ObjectProperty(objectProperty: IObjectProperty): void;
}

export interface IObjectPropertySelector<TResult>
{
    ObjectProperty(objectProperty: IObjectProperty): TResult;
}

export interface IDataPropertyVisitor
{
    DataProperty(dataProperty: IDataProperty): void;
}

export interface IDataPropertySelector<TResult>
{
    DataProperty(dataProperty: IDataProperty): TResult;
}

export interface IPropertyVisitor extends
    IObjectPropertyVisitor,
    IDataPropertyVisitor
{
}

export interface IPropertySelector<TResult> extends
    IObjectPropertySelector<TResult>,
    IDataPropertySelector<TResult>
{
}

export interface IProperty extends IEntity, IPropertyExpression
{
    Select<TResult>(selector: IPropertySelector<TResult>): TResult;
}

export interface IObjectProperty extends IProperty, IObjectPropertyExpression
{
    Select<TResult>(selector: IObjectPropertySelector<TResult>): TResult;
}

export interface IDataProperty extends IProperty, IDataPropertyExpression
{
    Select<TResult>(selector: IDataPropertySelector<TResult>): TResult;
}

export interface IInverseObjectProperty extends IObjectPropertyExpression
{
    readonly ObjectProperty: IObjectProperty;
}
