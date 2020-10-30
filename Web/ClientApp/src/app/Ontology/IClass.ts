import { IClassExpression } from "./IClassExpression";
import { IEntity } from "./IEntity";
import { IHasKey } from "./IHasKey";
import { INamedIndividual } from "./INamedIndividual";
import { IDataPropertyExpression, IObjectPropertyExpression } from "./IPropertyExpression";
import { ISubClassOf } from "./ISubClassOf";

export interface IClass extends
    IEntity,
    IClassExpression
{
    // Provided to assist programatic construction of ontologies.
    DeclareObjectProperty(localName: string): IObjectPropertyExpression;
    DeclareDataProperty(localName: string): IDataPropertyExpression;
    DeclareFunctionalDataProperty(localName: string): IDataPropertyExpression;
    HasKey(dataPropertyExpressions: IDataPropertyExpression[]): IHasKey
    SubClassOf(superClassExpression: IClassExpression): ISubClassOf;
    NamedIndividual(localName: string): INamedIndividual;
}
