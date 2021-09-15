import { Observable } from 'rxjs';
import { Fact } from './EavStore';

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

export type MapToAny<T> = { [K in keyof T]: any };

export interface IEavStore
{
    ObserveEntities(): Observable<Set<any>>;
    ObserveAttribute<TDomain = any, TRange = any>(attribute: string): Observable<[TDomain, TRange][]>;
    Observe<T extends [any, ...any[]]>(head: MapToAny<T>, ...body: Fact[]): Observable<T[]>;
    Query(
        head: any[],
        ...body: Fact[]): any[][];
    NewEntity(): any;
    DeleteEntity(entity: any): void
    Add(
        entity   : any,
        attribute: string,
        value    : any): void;
    Add(object: object): any;
    Add(objects: object[]): any[];
    Clear(): void;
}

export const StoreSymbol = Symbol('Store');

export const Store = (object: object) => <IEavStore>object[StoreSymbol];
