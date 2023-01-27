import { Observable } from 'rxjs';
import { IScheduler, Signal } from '../Signal';
import { BuiltIn } from './Atom';
import { ITransaction } from './ITransactionManager';

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

export type Variable = string;
export const IsVariable = (term): term is string => typeof term === 'string' && term[0] === '?';
export const IsConstant = term => !(typeof term === 'undefined' || IsVariable(term));

export type Idb = Fact;
export type Edb = [string, any, ...any[]];
export const IsEdb = (atom): atom is Edb => atom instanceof Array && typeof atom[0] === 'string' && atom[0][0] !== '?';

export type Atom = Idb | Edb | BuiltIn;

export type Rule = [[string, any, ...any[]], Atom[]];

export interface IEavStore
{
    readonly SignalScheduler: IScheduler;
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

    SignalEntities(): Signal<Set<any>>;
    Signal(atom: Fact): Signal<Fact[]>;
    Signal(attribute: PropertyKey): Signal<[any, any][]>;
    Signal<T extends [any, ...any[]]>(
        head: T,
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
