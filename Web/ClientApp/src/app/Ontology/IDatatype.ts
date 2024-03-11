import { IDataRange } from "./IDataRange";
import { IEntity } from "./IEntity";

export interface IDatatypeVisitor
{
    Datatype(datatype: IDatatype): void;
}

export interface IDatatypeSelector<TResult>
{
    Datatype(datatype: IDatatype): TResult;
}

export interface IDatatype extends
    IEntity,
    IDataRange
{
    Select<TResult>(selector: IDatatypeSelector<TResult>): TResult;
}
