import { IEntity } from "./IEntity";
import { IIndividual } from "./IIndividual";

export interface INamedIndividualSelector<TResult>
{
    NamedIndividual(namedIndividual: INamedIndividual): TResult
}

export interface INamedIndividual extends IEntity, IIndividual
{
    Select<TResult>(selector: INamedIndividualSelector<TResult>): TResult;
}
