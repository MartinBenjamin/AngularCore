import { IClassExpression } from "./IClassExpression";
import { IEntity } from "./IEntity";
import { IHasKey } from "./IHasKey";
import { INamedIndividual } from "./INamedIndividual";
import { IDataPropertyExpression, IObjectPropertyExpression } from "./IPropertyExpression";
import { ISubClassOf } from "./ISubClassOf";
import { IEquivalentClasses } from "./IEquivalentClasses";

export interface IClass extends
    IEntity,
    IClassExpression
{
    // Provided to assist construction of ontologies.
    DeclareObjectProperty(localName: string): IObjectPropertyExpression;
    DeclareDataProperty(localName: string): IDataPropertyExpression;
    DeclareFunctionalDataProperty(localName: string): IDataPropertyExpression;
    DeclareNamedIndividual(localName: string): INamedIndividual;
    HasKey(dataPropertyExpressions: IDataPropertyExpression[]): IHasKey
    SubClassOf(superClassExpression: IClassExpression): ISubClassOf;
    Define(definition: IClassExpression): IEquivalentClasses;
}
