import { IClassExpression } from "./IClassExpression";
import { IEntity } from "./IEntity";
import { IEquivalentClasses } from "./IEquivalentClasses";
import { IHasKey } from "./IHasKey";
import { INamedIndividual } from "./INamedIndividual";
import { IDataPropertyExpression } from "./IPropertyExpression";
import { ISubClassOf } from "./ISubClassOf";

export interface IClassVisitor
{
    Class(class$: IClass): void;
}

export interface IClassSelector<TResult>
{
    Class(class$: IClass): TResult;
}

export interface IClass extends
    IEntity,
    IClassExpression
{
    Accept(visitor: IClassVisitor): void;
    Select<TResult>(selector: IClassSelector<TResult>): TResult;

    // Provided to assist construction of ontologies.
    DeclareNamedIndividual(localName: string): INamedIndividual;
    HasKey(dataPropertyExpressions: IDataPropertyExpression[]): IHasKey
    SubClassOf(superClassExpression: IClassExpression): ISubClassOf;
    Define(definition: IClassExpression): IEquivalentClasses;
}
