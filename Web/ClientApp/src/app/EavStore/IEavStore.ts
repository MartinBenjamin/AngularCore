import { Observable } from 'rxjs';
import { IScheduler, Signal } from '../Signal/Signal';
import { Atom, Rule } from './Datalog';
import { Fact, PropertyKey } from './Fact';
import { ITransaction } from './ITransactionManager';
import { Tuple } from './Tuple';

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

export {
    PropertyKey,
    Fact
};

export interface IEavStore
{
    readonly SignalScheduler: IScheduler;
    Entities(): Set<any>;
    Query(atom: Fact): Fact[];
    Query<T extends Tuple>(
        head: [...T],
        body: Atom[],
        ...rules: Rule[]): { [K in keyof T]: any; }[];

    ObserveEntities(): Observable<Set<any>>;
    Observe(atom: Fact): Observable<Fact[]>;
    Observe(attribute: PropertyKey): Observable<[any, any][]>;
    Observe<T extends Tuple>(
        head: [...T],
        body: Atom[],
        ...rules: Rule[]): Observable<{ [K in keyof T]: any; }[]>;

    SignalEntities(): Signal<Set<any>>;
    Signal(atom: Fact): Signal<Fact[]>;
    Signal(attribute: PropertyKey): Signal<[any, any][]>;
    Signal<T extends Tuple>(
        head: [...T],
        body: Atom[],
        ...rules: Rule[]): Signal<{ [K in keyof T]: any; }[]>;

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
