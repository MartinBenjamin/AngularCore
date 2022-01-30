import { Observable } from 'rxjs';
import { ITransaction } from './ITransactionManager';

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
    Observe<T extends [any, ...any[]]>(
        head: T,
        ...body: Fact[]): Observable<{ [K in keyof T]: any; }[]>;
    Query<T extends [any, ...any[]]>(
        head: T,
        ...body: Fact[]): { [K in keyof T]: any; }[];

    NewEntity(): any;
    DeleteAttribute(entity: any, attribute: PropertyKey): boolean
    DeleteEntity(entity: any): void

    Assert(
        entity   : any,
        attribute: string,
        value    : any): void;
    Add(object: object, added?: Map<object, any>): any;

    SuspendPublish(): void;
    UnsuspendPublish(): void;

    BeginTransaction(): ITransaction;

    Clear(): void;
}

export const StoreSymbol = Symbol('Store');

export const Store = (object: object) => <IEavStore>object[StoreSymbol];
