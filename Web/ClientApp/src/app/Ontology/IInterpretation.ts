import { IClassExpression } from "./IClassExpression";
import { IIndividual } from "./IIndividual";
import { IDataPropertyExpression, IObjectPropertyExpression } from "./IPropertyExpression";

export interface IInterpretation<T>
{
    Individual(individual: IIndividual): any;
    ObjectPropertyExpression(objectPropertyExpression: IObjectPropertyExpression): T;
    DataPropertyExpression(dataPropertyExpression: IDataPropertyExpression): T;
    ClassExpression(classExpression: IClassExpression): T;
}
