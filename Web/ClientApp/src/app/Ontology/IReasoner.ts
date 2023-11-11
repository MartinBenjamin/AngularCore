import { IClassExpression } from './IClassExpression';
import { IPropertyExpression } from './IPropertyExpression';
import { Wrapped, WrapperType } from './Wrapped';

export interface IReasoner<T>
{
    ClassExpression(classExpression: IClassExpression);
    PropertyExpression(propertyExpression: IPropertyExpression);
}


export class Reasoner<T extends WrapperType> implements IReasoner<Wrapped<T, Set<any>>>
{
    ClassExpression(
        classExpression: IClassExpression
        )
    {
        throw new Error("Method not implemented.");
    }

    PropertyExpression(
        propertyExpression: IPropertyExpression
        )
    {
        throw new Error("Method not implemented.");
    }
}
