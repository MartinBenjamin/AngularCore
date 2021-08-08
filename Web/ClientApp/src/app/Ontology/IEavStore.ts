import { Observable } from 'rxjs';

export enum Cardinality
{
    One = 1,
    Many
}

export interface AttributeSchema
{
    Name           : string,
    UniqueIdentity?: boolean,
    Cardinality   ?: Cardinality
}

export interface IEavStore
{
    ObserveEntities(): Observable<Set<any>>;
    ObserveAttribute(attribute: string): Observable<[any, any][]>
    NewEntity(): any;
    Add(
        entity   : any,
        attribute: string,
        value    : any): void;
    Add(object: object): any;
    Add(objects: object[]): any[];
}

export const StoreSymbol = Symbol('Store');

export const Store = (object: object) => <IEavStore>object[StoreSymbol];
