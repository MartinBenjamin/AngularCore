import { IEntity } from "./IEntity";
import { IOntology } from "./IOntology";

export interface IPropertyExpression extends IEntity
{
    //Values(
    //    context   : IOntology,
    //    individual: object): Iterable<object>;
}

export interface IObjectPropertyExpression extends IPropertyExpression
{
}

export interface IDataPropertyExpression extends IPropertyExpression
{
    //AreEqual(
    //    context: IOntology,
    //    lhs    : object,
    //    rhs    : object): boolean;
}
