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

export type Fact = [any, PropertyKey, any];

export interface IEavStore
{
    ObserveEntities(): Observable<Set<any>>;
    ObserveAttribute<TDomain = any, TRange = any>(attribute: string): Observable<[TDomain, TRange][]>;
    Observe(
        head: any[],
        ...body: Fact[]): Observable<any[]>
    Query<T extends [any, ...any[]]>(
        head: T,
        ...body: Fact[]): { [K in keyof T]: any; }[];
    NewEntity(): any;
    DeleteEntity(entity: any): void
    Assert(
        entity   : any,
        attribute: string,
        value    : any): void;
    Add(object: object, added?: Map<object, any>): any;
    SuspendPublish(): void;
    UnsuspendPublish(): void;
    Clear(): void;
}

export const StoreSymbol = Symbol('Store');

export const Store = (object: object) => <IEavStore>object[StoreSymbol];
