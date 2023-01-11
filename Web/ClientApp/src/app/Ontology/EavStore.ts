import { combineLatest, Observable, Subscriber } from 'rxjs';
import { map } from 'rxjs/operators';
import { Scheduler, Signal } from '../Signal';
import { ArrayKeyedMap, TrieNode } from './ArrayKeyedMap';
import { BuiltIn } from './Atom';
import { Assert, AssertRetract, DeleteEntity, NewEntity, Retract } from './EavStoreLog';
import { Group } from './Group';
import { AttributeSchema, Cardinality, Fact, IEavStore, IsRuleInvocation, IsVariable, Rule, RuleInvocation, Store, StoreSymbol } from './IEavStore';
import { IPublisher } from './IPublisher';
import { ITransaction, ITransactionManager, TransactionManager } from './ITransactionManager';
import { StronglyConnectedComponents } from './StronglyConnectedComponents';
import { ArrayCompareFactory } from './SortedSet';

type Tuple = any[];

const EntityId = Symbol('EntityId');

function Compare(
    a: any,
    b: any
    ): number
{
    if(a === b)
        return 0;

    const aType = typeof a;
    const bType = typeof b;

    if(aType !== bType)
        return aType.localeCompare(bType);

    if(typeof a === 'object')
    {
        const aId = a[EntityId];
        if(typeof aId === 'number')
        {
            const bId = b[EntityId];
            if(typeof bId === 'number')
                return aId - bId;
        }
    }

    return a < b ? -1 : 1
}

const tupleCompare = ArrayCompareFactory(Compare);

function Match<TTrieNode extends TrieNode<TTrieNode, V>, V>(
    trieNode: TTrieNode,
    fact    : Fact,
    callback: (atom: Fact, value: V) => void,
    atom    = []
    )
{
    if(atom.length === fact.length)
    {
        callback(
            <Fact>atom,
            trieNode.value);
        return;
    }

    let child = trieNode.children.get(fact[atom.length]);
    if(child)
        Match(
            child,
            fact,
            callback,
            [...atom, fact[atom.length]]);

    if(fact[atom.length] !== undefined)
    {
        child = trieNode.children.get(undefined);
        if(child)
            Match(
                child,
                fact,
                callback,
                [...atom, undefined]);
    }
}

type Action = () => void;

export class EavStore implements IEavStore, IPublisher
{
    private _eav                 = new Map<any, Map<PropertyKey, any>>();
    private _aev                 = new Map<PropertyKey, Map<any, any>>();
    private _ave                 : Map<PropertyKey, Map<any, any>>;
    private _nextEntityId        = 1
    private _entitiesSubscribers = new Set<Subscriber<Set<any>>>();
    private _entitiesSignal      : Signal<Set<any>>;
    private _atomActions         = new ArrayKeyedMap<Fact, Set<Action>>();
    private _schema              : Map<PropertyKey, AttributeSchema>;
    private _publishSuspended    = 0;
    private _unsuspendActions    = new Set<Action>();
    private _transactionManager  : ITransactionManager = new TransactionManager();
    private _publishEntities     : Action;

    readonly SignalScheduler = new Scheduler();

    constructor(
        attributeSchema: AttributeSchema[] = [],
        private _defaultCardinality = Cardinality.Many
        )
    {
        this._schema = new Map<PropertyKey, AttributeSchema>(attributeSchema.map(attributeSchema => [attributeSchema.Name, attributeSchema]));
        this._ave = new Map<PropertyKey, Map<any, any>>(
            attributeSchema
                .filter(attributeSchema => attributeSchema.UniqueIdentity)
                .map(attributeSchema => [attributeSchema.Name, new Map<any, any>()]));

        this._publishEntities = () =>
        {
            if(this._entitiesSignal)
                this.SignalScheduler.Schedule(this._entitiesSignal);

            if(this._publishSuspended)
            {
                this._unsuspendActions.add(this._publishEntities);
                return;
            }

            if(this._entitiesSubscribers.size)
            {
                const entities = this.Entities();
                this._entitiesSubscribers.forEach(subscriber => subscriber.next(entities));
            }
        };
    }

    public Entities(): Set<any>
    {
        return new Set<any>(this._eav.keys());
    }

    ObserveEntities(): Observable<Set<any>>
    {
        return new Observable<Set<any>>(
            subscriber =>
            {
                this._entitiesSubscribers.add(subscriber);
                subscriber.add(() => this._entitiesSubscribers.delete(subscriber));
                subscriber.next(this.Entities());
            });
    }

    SignalEntities(): Signal<Set<any>, any[]>
    {
        if(!this._entitiesSignal)
        {
            this._entitiesSignal = this.SignalScheduler.AddSignal(() => this.Entities());
            this._entitiesSignal.AddRemoveAction(() => this._entitiesSignal = null);
        }
        return this._entitiesSignal;
    }

    private QueryAtom(
        [entity, attribute, value]: Fact
        ): Fact[]
    {
        const facts: Fact[] = [];
        if(typeof entity !== 'undefined')
        {
            const av = this._eav.get(entity)
            if(av)
                if(typeof attribute !== 'undefined')
                {
                    const v = av.get(attribute);
                    if(typeof value !== 'undefined')
                    {
                        if(v instanceof Array)
                            facts.push(...v.filter(v => v === value).map<Fact>(v => [entity, attribute, value]));

                        else if(v === value)
                            facts.push([entity, attribute, value]);
                    }
                    else
                    {
                        if(v instanceof Array)
                            facts.push(...v.map<Fact>(v => [entity, attribute, v]));

                        else if(typeof v !== 'undefined' && v !== null)
                            facts.push([entity, attribute, v]);
                    }
                }
                else for(const [a, v] of av)
                    if(typeof value !== 'undefined')
                    {
                        if(v instanceof Array)
                            facts.push(...v.filter(v => v === value).map<Fact>(v => [entity, a, value]));

                        else if(v === value)
                            facts.push([entity, a, value]);
                    }
                    else
                    {
                        if(v instanceof Array)
                            facts.push(...v.map<Fact>(v => [entity, a, v]));

                        else if(typeof v !== 'undefined' && v !== null)
                            facts.push([entity, a, v]);
                    }
        }
        else if(typeof attribute !== 'undefined')
        {
            const ev = this._aev.get(attribute);
            if(ev)
                for(const [e, v] of ev)
                    if(typeof value !== 'undefined')
                    {
                        if(v instanceof Array)
                            facts.push(...v.filter(v => v === value).map<Fact>(v => ([e, attribute, value])));

                        else if(v === value)
                            facts.push([e, attribute, value]);
                    }
                    else
                    {
                        if(v instanceof Array)
                            facts.push(...v.map<Fact>(v => [e, attribute, v]));

                        else if(typeof v !== 'undefined' && v !== null)
                            facts.push([e, attribute, v]);
                    }
        }
        else for(const [e, av] of this._eav)
            for(const [a, v] of av)
                if(typeof value !== 'undefined')
                {
                    if(v instanceof Array)
                        facts.push(...v.filter(v => v === value).map<Fact>(v => [e, a, value]));
                        
                    else if(v === value)
                        facts.push([e, a, value]);
                }
                else
                {
                    if(v instanceof Array)
                        facts.push(...v.map<Fact>(v => [e, a, v]));

                    else if(typeof v !== 'undefined' && v !== null)
                        facts.push([e, a, v]);
                }

        return facts;
    }

    private QueryRule<T extends [any, ...any[]]>(
        head: T,
        body: (Fact | BuiltIn)[]): { [K in keyof T]: any; }[]
    {
        return body.reduce(
            (substitutions, atom) =>
            {
                if(typeof atom === 'function')
                    return [...atom(substitutions)];

                let count = substitutions.length;
                while(count--)
                {
                    const substitution = substitutions.shift();
                    // Substitute known variables.
                    for(const fact of this.QueryAtom(<Fact>atom.map(term => IsVariable(term) ? substitution[term] : term)))
                    {
                        let merged = { ...substitution };
                        for(let index = 0; index < atom.length && merged; ++index)
                        {
                            const term = atom[index];
                            if(IsVariable(term))
                            {
                                if(typeof merged[term] === 'undefined')
                                    merged[term] = fact[index];

                                else if(merged[term] !== fact[index])
                                    // Fact does not match query pattern.
                                    merged = null;
                            }
                        }

                        if(merged)
                            substitutions.push(merged);
                    }
                }

                return substitutions;
            },
            [{}]).map(substitution => <{ [K in keyof T]: any; }>head.map(term => (IsVariable(term) && term in substitution) ? substitution[term] : term));
    }

    Query(
        ...params
        ): any
    {
        return params.length === 1 ?
            this.QueryAtom(<Fact>params[0]) :
            this.QueryRule(
                params[0],
                params[1]);
    }

    private ObserveAtom(
        atom: Fact
        ): Observable<Fact[]>
    {
        atom = <Fact>atom.map(term => IsVariable(term) ? undefined : term);
        return new Observable<Fact[]>(
            subscriber =>
            {
                let actions = this._atomActions.get(atom);
                if(!actions)
                {
                    actions = new Set<Action>();
                    this._atomActions.set(
                        atom,
                        actions);
                }

                let action: Action = () =>
                {
                    if(this._publishSuspended)
                    {
                        this._unsuspendActions.add(action);
                        return;
                    }

                    subscriber.next(this.QueryAtom(atom));
                }

                actions.add(action);

                subscriber.add(
                    () =>
                    {
                        actions.delete(action);
                        if(!actions.size)
                            this._atomActions.delete(atom);
                    });

                action();
            });
    }

    private ObserveRule<T extends [any, ...any[]]>(
        head: T,
        body: (Fact | BuiltIn)[]): Observable<{ [K in keyof T]: any; }[]>
    {
        return combineLatest(
            body.filter(atom => atom instanceof Array).map(atom => this.ObserveAtom(<Fact>atom)),
            (...observed) =>
            {
                let observedIndex = 0;
                return body.reduce(
                    (substitutions, atom) =>
                    {
                        if(typeof atom === 'function')
                            return [...atom(substitutions)];

                        let count = substitutions.length;
                        while(count--)
                        {
                            const substitution = substitutions.shift();
                            for(const fact of observed[observedIndex])
                            {
                                let merged = { ...substitution };
                                for(let index = 0; index < atom.length && merged; ++index)
                                {
                                    const term = atom[index];
                                    if(IsVariable(term))
                                    {
                                        if(typeof merged[term] === 'undefined')
                                            merged[term] = fact[index];

                                        else if(merged[term] !== fact[index])
                                            // Fact does not match query pattern.
                                            merged = null;
                                    }
                                }

                                if(merged)
                                    substitutions.push(merged);
                            }
                        }

                        ++observedIndex;
                        return substitutions;
                    },
                    [{}]).map(substitution => <{ [K in keyof T]: any; }>head.map(term => (IsVariable(term) && term in substitution) ? substitution[term] : term));
            });
    }

    Observe(
        ...params
        ): any
    {
        if(params.length === 1)
            return params[0] instanceof Array ?
                this.ObserveAtom(<Fact>params[0]) :
                this.ObserveAtom([undefined, <PropertyKey>params[0], undefined]).pipe(map(facts => facts.map(([entity, , value]) => [entity, value])));

        return this.ObserveRule(
            params[0],
            params[1]);
    }

    private SignalAtom(
        atom: Fact
        ): Signal<Fact[]>
    {
        atom = <Fact>atom.map(term => IsVariable(term) ? undefined : term);
        const signal = this.SignalScheduler.AddSignal(() => this.QueryAtom(atom));

        let actions = this._atomActions.get(atom);
        if(!actions)
        {
            actions = new Set<Action>();
            this._atomActions.set(
                atom,
                actions);
        }

        let action: Action = () => this.SignalScheduler.Schedule(signal);
        actions.add(action);

        signal.AddRemoveAction(
            () =>
            {
                actions.delete(action);
                if(!actions.size)
                    this._atomActions.delete(atom);
            });

        return signal;
    }

    SignalRule<T extends [any, ...any[]]>(
        head: T,
        body: (Fact | BuiltIn | RuleInvocation)[],
        ...rules: Rule[]): Signal<{ [K in keyof T]: any; }[]>
    {
        rules = [[<[string, any, ...any[]]>['', ...head], body], ...rules];
        const rulesGroupedByName = Group(
            rules,
            rule => rule[0][0],
            rule => rule);

        const ruleAdjacencyList = new Map(
            rules.map<[string, string[]]>(
                rule => [
                    rule[0][0],
                    [].concat(...rulesGroupedByName.get(rule[0][0]).map(rule => rule[1].filter(IsRuleInvocation).map(ruleInvocation => ruleInvocation[0])))]));

        const stronglyConnectedComponents = StronglyConnectedComponents(ruleAdjacencyList);

        const signalAdjacencyList = new Map<Signal, Signal[]>();
        const signals = new Map<string, Signal>();
        const conjunctions = new Map<Signal, Rule>();

        // Transform strong connected components.
        for(const stronglyConnectedComponent of stronglyConnectedComponents)
            for(const ruleName of stronglyConnectedComponent)
                if(stronglyConnectedComponent.length === 1)
                {
                    const rules = rulesGroupedByName.get(stronglyConnectedComponent[0]);
                    if(rules.length === 1)
                    {
                        const rule = rules[0];
                        const signal = new Signal(EavStore.Conjunction(rule));
                        signals.set(
                            ruleName,
                            signal);
                        conjunctions.set(
                            signal,
                            rule);
                    }
                    else
                    {
                        const signal = new Signal(EavStore.Disjunction);
                        signals.set(
                            ruleName,
                            signal);

                        const adjacentSignals: Signal[] = [];
                        signalAdjacencyList.set(
                            signal,
                            adjacentSignals);

                        for(const rule of rules)
                        {
                            const signal = this.Signal(EavStore.Conjunction(rule));
                            adjacentSignals.push(signal);
                            conjunctions.set(
                                signal,
                                rule);                
                        }
                    }
                }

        for(const [signal, rule] of conjunctions)
        {
            const successors: Signal[] = [];
            signalAdjacencyList.set(
                signal,
                successors);
            for(const atom of rule[1])
                if(atom instanceof Function)
                {
                    const successor = new Signal(() => atom);
                    successors.push(successor);
                    signalAdjacencyList.set(
                        successor,
                        []);
                }
                else
                {
                    const successor = new Signal(EavStore.Substitute(IsRuleInvocation(atom) ? atom.slice(1) : atom));
                    successors.push(successor);
                    signalAdjacencyList.set(
                        successor,
                        [IsRuleInvocation(atom) ? signals.get(atom[0]) : this.SignalAtom(atom)]);
                }
        }

        this.SignalScheduler.AddSignals(signalAdjacencyList);
        return signals.get('');
    }

    private static Substitute(
        terms: any[]
        ): (tuples: Iterable<Tuple>) => object[]
    {
        return (tuples: Iterable<Tuple>) =>
        {
            const substitutions: object[] = [];
            for(const tuple of tuples)
            {
                let substitution = {};
                for(let index = 0; index < terms.length && substitution; ++index)
                {
                    const term = terms[index];
                    if(IsVariable(term))
                    {
                        if(substitution[term] === undefined)
                            substitution[term] = tuple[index];

                        else if(substitution[term] !== tuple[index])
                            // Tuple does not match query pattern.
                            substitution = null;
                    }
                }

                if(substitution)
                    substitutions.push(substitution)
            }

            return substitutions;
        };
    }

    private static Conjunction(
        rule: Rule       
        ): (...inputs: (object[] | BuiltIn)[]) => Tuple[]
    {
        const [[, ...terms],] = rule;
        return (...inputs: (object[] | Function)[]) => inputs.slice(1).reduce(
            (substitutions: object[], input) =>
            {
                if(typeof input === 'function')
                    return [...input(substitutions)];

                let count = substitutions.length;
                while(count--)
                {
                    const outer = substitutions.shift();
                    for(const inner of input)
                    {
                        let match = true;
                        for(const variable in inner)
                            if(!(outer[variable] === undefined || outer[variable] === inner[variable]))
                            {
                                match = false;
                                break;
                            }

                        if(match)
                            substitutions.push({ ...outer, ...inner });
                    }
                }

                return substitutions;
            },
            <object[]>inputs[0]).map(substitution => terms.map(term => (IsVariable(term) && term in substitution) ? substitution[term] : term));
    }

    private static Disjunction(
        ...inputs: Iterable<Tuple>[]
        ): Tuple[]
    {
        return null;
    }

    Signal(
        ...params
        ): any
    {
        if(params.length === 1)
            return params[0] instanceof Array ?
                this.SignalAtom(<Fact>params[0]) :
                this.SignalScheduler.AddSignal(
                    (facts: Fact[]) => facts.map(([entity, , value]) => [entity, value]),
                    [this.SignalAtom([undefined, <PropertyKey>params[0], undefined])]);

        return this.SignalRule(
            params[0],
            params[1],
            ...params.slice(2));
    }

    NewEntity(
        target?: object
        ): any
    {
        const av = new Map<PropertyKey, any>();
        const entity = EntityProxyFactory(
            this,
            av,
            this._aev,
            this._ave,
            target);
        this._eav.set(
            entity,
            av);

        if(this._transactionManager.Active)
            this._transactionManager.Log(
                new NewEntity(
                    entity,
                    () => this.DeleteEntity(entity)));

        entity[StoreSymbol] = this;
        entity[EntityId   ] = this._nextEntityId++;

        this.PublishEntities();
        return entity;
    }

    DeleteEntity(
        entity: any
        ): void
    {
        const av = this._eav.get(entity);
        if(av)
        {
            this.SuspendPublish();
            for(const [attribute, value] of av)
            {
                av.delete(attribute);

                const ev = this._aev.get(attribute);
                ev.delete(entity);
                if(!ev.size)
                    this._aev.delete(attribute);

                const ve = this._ave.get(attribute);
                if(ve)
                    ve.delete(value);

                if(value instanceof Array)
                    value.forEach(
                        value => this.PublishRetract(
                            entity,
                            attribute,
                            value));

                else
                    this.PublishRetract(
                        entity,
                        attribute,
                        value);
            }

            this._eav.delete(entity);

            if(this._transactionManager.Active)
                this._transactionManager.Log(
                    new DeleteEntity(
                        entity,
                        () =>
                        {
                            this._eav.set(
                                entity,
                                av);
                            entity[StoreSymbol] = this;
                            this.PublishEntities();
                        }));

            this.PublishEntities();
            this.UnsuspendPublish();
        }
    }

    //Assert(
    //    entity   : any,
    //    attribute: PropertyKey,
    //    value    : any
    //    ): void
    //{
    //    let currentValue = entity[attribute];

    //    if(typeof currentValue === 'undefined' && this.Cardinality(attribute) === Cardinality.Many)
    //        currentValue = entity[attribute] = ArrayProxyFactory(
    //            this,
    //            entity,
    //            attribute,
    //            []);

    //    if(currentValue instanceof Array)
    //        currentValue.push(value);

    //    else
    //        entity[attribute] = value;

    //}

    Assert(
        entity   : any,
        attribute: PropertyKey,
        value    : any): void;
    Assert(object: object): any;
    Assert(
        entity    : any,
        attribute?: PropertyKey,
        value    ?: any
        ): void
    {
        if(typeof attribute === 'undefined')
            try
            {
                this.SuspendPublish();
                const added = new Map<object, any>();
                return this.AddObject(
                    entity,
                    added);
            }
            finally
            {
                this.UnsuspendPublish();
            }

        const av = this._eav.get(entity);
        let ev = this._aev.get(attribute);
        let previousValue = av.get(attribute);

        if(previousValue === undefined && this.Cardinality(attribute) === Cardinality.Many)
        {
            previousValue = ArrayProxyFactory(
                this,
                entity,
                attribute,
                []);

            av.set(
                attribute,
                previousValue);

            if(!ev)
            {
                ev = new Map<any, any>();
                this._aev.set(
                    attribute,
                    ev);
            }

            ev.set(
                entity,
                previousValue);
        }

        if(previousValue instanceof Array)
        {
            previousValue[TargetSymbol].push(value);
            this.PublishAssert(
                entity,
                attribute,
                value);
        }
        else
        {
            const implicitRetract = previousValue !== undefined || av.has(attribute);
            const ve = this._ave.get(attribute);
            if(ve)
            {
                if(typeof ve.get(value) !== 'undefined')
                    // Value already in use for attribute.
                    throw 'Unique Identity Conflict';

                ve.delete(previousValue);
                ve.set(
                    value,
                    entity);
            }

            av.set(
                attribute,
                value);

            if(!ev)
            {
                ev = new Map<any, any>();
                this._aev.set(
                    attribute,
                    ev);
            }

            ev.set(
                entity,
                value);

            if(!implicitRetract)
                this.PublishAssert(
                    entity,
                    attribute,
                    value);

            else
                this.PublishAssertRetract(
                    entity,
                    attribute,
                    value,
                    previousValue);
        }
    }

    Retract(
        entity   : any,
        attribute: PropertyKey,
        value    : any
        ): void
    {
        const av = this._eav.get(entity);
        let previousValue = av.get(attribute);

        if(previousValue instanceof Array)
        {
            const index = previousValue.indexOf(value);

            if(index === -1)
                throw 'Unknown fact.';

            previousValue[TargetSymbol].splice(
                index,
                1);
        }
        else if(previousValue !== value)
            throw 'Unknown fact.';

        else
        {
            av.delete(attribute);

            const ev = this._aev.get(attribute);
            ev.delete(entity);
            if(!ev.size)
                this._aev.delete(attribute);

            const ve = this._ave.get(attribute);
            if(ve)
                ve.delete(value);
        }

        this.PublishRetract(
            entity,
            attribute,
            value);
    }

    Clear(): void
    {
        this._eav.clear();
        this._aev.clear();

        for(const ve of this._ave.values())
            ve.clear();
    }

    private AddObject(
        object: object,
        added : Map<object, any>
        ): any
    {
        if(typeof object !== 'object' ||
            object === null ||
            object instanceof Date)
            return object;

        if(Store(object) === this)
            return object;

        let entity = added.get(object);
        if(entity)
            return entity;

        [...this._ave]
            .filter(([attribute,]) => attribute in object)
            .forEach(([attribute,ve]) =>
            {
                if(typeof entity === 'undefined')
                    entity = ve.get(object[attribute]);

                else if(entity != ve[object[attribute]])
                    throw 'Unique Identity Conflict';
            });

        if(!entity)
            entity = this.NewEntity(object);

        added.set(
            object,
            entity);

        for(const key of Reflect.ownKeys(object)) // Include Symbol keys.
        {
            const value = object[key];
            if(value instanceof Array)
            {
                if(!entity[key])
                    entity[key] = ArrayProxyFactory(
                        this,
                        entity,
                        key,
                        []);

                entity[key].push(...value
                    .map(element => this.AddObject(
                        element,
                        added))
                    .filter(element => !entity[key].includes(element)));
            }
            else
                entity[key] = this.AddObject(
                    value,
                    added);
        }

        return entity;
    }

    PublishEntities()
    {
        this._publishEntities();
    }

    SuspendPublish(): void
    {
        this.SignalScheduler.Suspend();
        if(!this._publishSuspended)
            this._unsuspendActions.clear();

        ++this._publishSuspended;
    }

    UnsuspendPublish(): void
    {
        this.SignalScheduler.Unsuspend();
        --this._publishSuspended;
        if(!this._publishSuspended)
            this._unsuspendActions.forEach(action => action());
    }

    PublishAssert(
        entity   : any,
        attribute: PropertyKey,
        value    : any
        ): void
    {
        if(this._transactionManager.Active)
            this._transactionManager.Log(
                new Assert(
                    entity,
                    attribute,
                    value));

        Match(
            this._atomActions,
            [entity, attribute, value],
            (atom, actions: Set<Action>) => actions.forEach(action => action()));
    }

    PublishRetract(
        entity   : any,
        attribute: PropertyKey,
        value    : any
        ): void
    {
        if(this._transactionManager.Active)
            this._transactionManager.Log(
                new Retract(
                    entity,
                    attribute,
                    value));

        Match(
            this._atomActions,
            [entity, attribute, value],
            (atom, actions: Set<Action>) => actions.forEach(action => action()));
    }

    PublishAssertRetract(
        entity        : any,
        attribute     : PropertyKey,
        assertedValue : any,
        retractedValue: any
        ): void
    {
        if(this._transactionManager.Active)
            this._transactionManager.Log(
                new AssertRetract(
                    entity,
                    attribute,
                    assertedValue,
                    retractedValue));

        this.SuspendPublish();
        Match(
            this._atomActions,
            [entity, attribute, assertedValue],
            (atom, actions: Set<Action>) => actions.forEach(action => action()));
        Match(
            this._atomActions,
            [entity, attribute, retractedValue],
            (atom, actions: Set<Action>) => actions.forEach(action => action()));
        this.UnsuspendPublish();
    }

    BeginTransaction(): ITransaction
    {
        return this._transactionManager.BeginTransaction();
    }

    private Cardinality(
        attribute: PropertyKey
        ): Cardinality
    {
        const attributeSchema = this._schema.get(attribute);
        if(attributeSchema && typeof attributeSchema.Cardinality !== 'undefined')
            return attributeSchema.Cardinality;

        console.warn(`No schema for attribute: ${String(attribute)}`);
        return this._defaultCardinality;
    }
}

function EntityProxyFactory(
    publisher: IPublisher,
    av       : Map<PropertyKey, any>,
    aev      : Map<PropertyKey, Map<any, any>>,
    ave      : Map<PropertyKey, Map<any, any>>,
    target   : object = {}
    ): object
{
    let handler: ProxyHandler<object> = {
        get: function(
            target,
            p
            ): any
        {
            const value = av.get(p);
            return typeof value === 'undefined' ? Reflect.getPrototypeOf(target)[p] : value;
        },
        getOwnPropertyDescriptor: function(
            target,
            key
            ): PropertyDescriptor
        {
            return {
                value       : av.get(key),
                configurable: true,
                enumerable  : true
            };
        },
        has: function(
            target,
            p
            ): boolean
        {
            return av.has(p);
        },
        ownKeys: function(): PropertyKey[]
        {
            return [...av.keys()];
        },
        set: function(
            target,
            p,
            value,
            receiver
            ): boolean
        {
            const previousValue = av.get(p);
            if(previousValue === value)
                return true;

            const implicitRetract = previousValue !== undefined || av.has(p);

            const ve = ave.get(p);
            if(ve)
            {
                if(typeof ve.get(value) !== 'undefined')
                    // Value already in use for attribute.
                    throw 'Unique Identity Conflict';

                ve.delete(previousValue);
                ve.set(
                    value,
                    receiver);
            }

            av.set(
                p,
                value);

            let ev = aev.get(p);
            if(!ev)
            {
                ev = new Map<any, any>();
                aev.set(
                    p,
                    ev);
            }

            ev.set(
                receiver,
                value);

            if(!(value instanceof Array))
                if(!implicitRetract)
                    publisher.PublishAssert(
                        receiver,
                        p,
                        value);

                else
                    publisher.PublishAssertRetract(
                        receiver,
                        p,
                        value,
                        previousValue);

            return true;
        }
    };

    return new Proxy(
        target, // Use target for prototype.
        handler);
}

function ArrayMethodHandlerFactory(
    publisher  : IPublisher,
    attribute  : PropertyKey,
    targetArray: any[]
    ): ProxyHandler<{ (...args): any }>
{
    return <ProxyHandler<{ (...args): any }>>
        {
            apply(
                targetMethod,
                thisArg,
                argArray
                ): any
            {
                const result = targetMethod.call(
                    targetArray,
                    ...argArray);
                //if(publisher)
                //    publisher.PublishAttribute(attribute);
                return result;
            }
        };
}

function PushUnshiftMethodHandlerFactory(
    publisher  : IPublisher,
    entity     : any,
    attribute  : PropertyKey,
    targetArray: any[]
    ): ProxyHandler<{ (...args): any }>
{
    return <ProxyHandler<{ (...args): any }>>
        {
            apply(
                targetMethod,
                thisArg,
                argArray
                ): any
            {
                const result = targetMethod.call(
                    targetArray,
                    ...argArray);

                publisher.SuspendPublish();
                [...argArray].forEach(
                    value => publisher.PublishAssert(
                        entity,
                        attribute,
                        value));
                publisher.UnsuspendPublish();

                return result;
            }
        };
}

function PopShiftMethodHandlerFactory(
    publisher  : IPublisher,
    entity     : any,
    attribute  : PropertyKey,
    targetArray: any[]
    ): ProxyHandler<{ (...args): any }>
{
    return <ProxyHandler<{ (...args): any }>>
        {
            apply(
                targetMethod,
                thisArg,
                argArray
                ): any
            {
                const result = targetMethod.call(
                    targetArray,
                    ...argArray);
                if(typeof result !== 'undefined')
                    publisher.PublishRetract(
                        entity,
                        attribute,
                        result);
                return result;
            }
        };
}

function SpliceMethodHandlerFactory(
    publisher  : IPublisher,
    entity     : any,
    attribute  : PropertyKey,
    targetArray: any[]
    ): ProxyHandler<{ (...args): any }>
{
    return <ProxyHandler<{ (...args): any }>>
        {
            apply(
                targetMethod,
                thisArg,
                argArray
                ): any
            {
                const result: any[] = targetMethod.call(
                    targetArray,
                    ...argArray);

                publisher.SuspendPublish();
                result.forEach(
                    retracted => publisher.PublishRetract(
                        entity,
                        attribute,
                        retracted));
                [...argArray].slice(2).forEach(
                    asserted => publisher.PublishAssert(
                        entity,
                        attribute,
                        asserted));
                publisher.UnsuspendPublish();

                return result;
            }
        };
}

function methodHandlersFactory2(
    publisher  : IPublisher,
    entity     : any,
    attribute  : PropertyKey,
    targetArray: any[]
    ): Map<PropertyKey, any>
{
    const methodHandler = ArrayMethodHandlerFactory(
        publisher,
        attribute,
        targetArray);

    return new Map(
        [
            'push',
            'pop',
            'shift',
            'unshift',
            'splice'
        ].map(methodName => [methodName, new Proxy(
            Array.prototype[methodName],
            methodHandler)]));
}

export const TargetSymbol = Symbol('Target');

function methodHandlersFactory(
    publisher  : IPublisher,
    entity     : any,
    attribute  : PropertyKey,
    targetArray: any[]
    ): Map<PropertyKey, ProxyHandler<{ (...args): any }>>
{
    const pushUnshiftMethodHandler = PushUnshiftMethodHandlerFactory(publisher, entity, attribute, targetArray);
    const popShiftMethodHandler    = PopShiftMethodHandlerFactory   (publisher, entity, attribute, targetArray);
    const spliceMethodHandler      = SpliceMethodHandlerFactory     (publisher, entity, attribute, targetArray);
    return new Map<PropertyKey, any>(
        [
            ['push'      , new Proxy(Array.prototype['push'   ], pushUnshiftMethodHandler)],
            ['pop'       , new Proxy(Array.prototype['pop'    ], popShiftMethodHandler   )],
            ['shift'     , new Proxy(Array.prototype['shift'  ], popShiftMethodHandler   )],
            ['unshift'   , new Proxy(Array.prototype['unshift'], pushUnshiftMethodHandler)],
            ['splice'    , new Proxy(Array.prototype['splice' ], spliceMethodHandler     )],
            [TargetSymbol, targetArray                                                    ]
        ]);
}

export function ArrayProxyFactory(
    publisher  : IPublisher,
    entity     : any,
    attribute  : PropertyKey,
    targetArray: any[]
    )
{
    const methodHandlers = methodHandlersFactory(
        publisher,
        entity,
        attribute,
        targetArray);

    const handler: ProxyHandler<[]> = {
        get: function(
            target,
            p
            ): any
        {
            return methodHandlers.get(p) || target[p];
        },
        set: function(
            target,
            p,
            value
            ): boolean
        {
            const previousValue = target[p];
            target[p] = value;
            publisher.PublishAssertRetract(
                entity,
                attribute,
                value,
                previousValue);
            return true;
        }
    };

    return new Proxy(
        targetArray,
        handler);
}
