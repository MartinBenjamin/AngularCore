import { Observable } from 'rxjs';
import { BuiltIn } from './Atom';
import { ITransaction } from './ITransactionManager';
import { Signal } from '../Signal';

export enum Cardinality
{
    One = 1,
    Many
}

export interface AttributeSchema
{
    Name           : PropertyKey,
    UniqueIdentity?: boolean,
    Cardinality   ?: Cardinality
}

export type Fact = [any, PropertyKey, any];

export interface IEavStore
{
    Entities(): Set<any>;
    Query(atom: Fact): Fact[];
    Query<T extends [any, ...any[]]>(
        head: T,
        body: (Fact | BuiltIn)[]): { [K in keyof T]: any; }[];

    ObserveEntities(): Observable<Set<any>>;
    Observe(atom: Fact): Observable<Fact[]>;
    Observe(attribute: PropertyKey): Observable<[any, any][]>;
    Observe<T extends [any, ...any[]]>(
        head: T,
        body: (Fact | BuiltIn)[]): Observable<{ [K in keyof T]: any; }[]>;

    Signal(atom: Fact): Signal<Fact[]>;
    Signal(attribute: PropertyKey): Signal<[any, any][]>;
    Signal<T extends [any, ...any[]]>(
        head: T,
        body: (Fact | BuiltIn)[]): Signal<{ [K in keyof T]: any; }[]>;

    NewEntity(): any;
    DeleteEntity(entity: any): void

    Assert(
        entity   : any,
        attribute: PropertyKey,
        value    : any): void;
    Assert(object: object): any;
    Retract(
        entity   : any,
        attribute: PropertyKey,
        value    : any): void;

    SuspendPublish(): void;
    UnsuspendPublish(): void;

    BeginTransaction(): ITransaction;

    Clear(): void;
}

export const StoreSymbol = Symbol('Store');

export const Store = (object: object) => <IEavStore>object[StoreSymbol];
