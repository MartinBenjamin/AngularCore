import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IScheduler, Scheduler, Signal } from '../Signal';
import { Wrap } from '../Wrap';
import { Transpose } from './AdjacencyList';
import { ArrayKeyedMap, TrieNode } from './ArrayKeyedMap';
import { BuiltIn } from './Atom';
import { Assert, AssertRetract, DeleteEntity, NewEntity, Retract } from './EavStoreLog';
import { Group } from './Group';
import { Atom, AttributeSchema, Cardinality, Edb, Fact, Idb, IEavStore, IsConstant, IsIdb, IsVariable, Rule, Store, StoreSymbol } from './IEavStore';
import { IPublisher } from './IPublisher';
import { ITransaction, ITransactionManager, TransactionManager } from './ITransactionManager';
import { ArrayCompareFactory, SortedSet } from './SortedSet';
import { StronglyConnectedComponents } from './StronglyConnectedComponents';

type Tuple = readonly any[];

export const EntityId = Symbol('EntityId');

export const TypeCollation = {
    'undefined': 0,
    'object'   : 1,
    'bigint'   : 2,
    'boolean'  : 3,
    'function' : 4,
    'number'   : 5,
    'string'   : 6,
    'symbol'   : 7
};

export function Compare(
    a: any,
    b: any
    ): number
{
    if(a === b)
        return 0;

    const aType = typeof a;
    const bType = typeof b;

    if(aType !== bType)
        return TypeCollation[aType] - TypeCollation[bType];

    if(aType === 'object')
    {
        if(a !== null && b !== null)
        {
            const aId = a[EntityId];
            if(typeof aId === 'number')
            {
                const bId = b[EntityId];
                if(typeof bId === 'number')
                    return aId - bId;
            }
        }

        return a - b;
    }

    return a < b ? -1 : 1;
}

export const tupleCompare = ArrayCompareFactory(Compare);

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

class Topic<TId = any, T = any>
{
    readonly Subscribers = new Set<(t: T) => void>();

    constructor(
        public readonly Id          : TId,
        public readonly Publisher   : () => T
        )
    {
    }

    Publish()
    {
        let published = this.Publisher();
        this.Subscribers.forEach(subscriber => subscriber(published))
    }
}

const EntitiesTopicId = [];

export class EavStore implements IEavStore, IPublisher
{
    private _eav                 = new Map<any, Map<PropertyKey, any>>();
    private _aev                 = new Map<PropertyKey, Map<any, any>>();
    private _ave                 : Map<PropertyKey, Map<any, any>>;
    private _nextEntityId        = 1
    private _entitiesObservable  : BehaviorSubject<Set<any>>;
    private _entitiesSignal      : Signal<Set<any>>;
    private _atomTopics          = new ArrayKeyedMap<Fact, Topic<Fact, Fact[]>>();
    private _entitiesTopic       : Topic<any, Set<any>>;
    private _scheduledTopics     = new SortedSet<Topic>((a, b) => tupleCompare(a.Id, b.Id));
    private _schema              : Map<PropertyKey, AttributeSchema>;
    private _publishSuspended    = 0;
    private _transactionManager  : ITransactionManager = new TransactionManager();

    readonly SignalScheduler: IScheduler = new Scheduler();

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

        this._entitiesTopic = new Topic(
            EntitiesTopicId,
            () => this.Entities());
    }

    public Entities(): Set<any>
    {
        return new Set<any>(this._eav.keys());
    }

    ObserveEntities(): Observable<Set<any>>
    {
        if(!this._entitiesObservable)
        {
            this._entitiesObservable = new BehaviorSubject<Set<any>>(this.Entities());
            this._entitiesTopic.Subscribers.add(entities => this._entitiesObservable.next(entities))
        }
        return this._entitiesObservable;
    }

    SignalEntities(): Signal<Set<any>, any[]>
    {
        if(!this._entitiesSignal)
        {
            this._entitiesSignal = this.SignalScheduler.AddSignal(() => this.Entities());

            const subscriber = (entities: Set<any>) => this.SignalScheduler.Inject(
                this._entitiesSignal,
                entities);

            this._entitiesTopic.Subscribers.add(subscriber);
            this._entitiesSignal.AddRemoveAction(
                () =>
                {
                    this._entitiesTopic.Subscribers.delete(subscriber);
                    this._entitiesSignal = null;
                });
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
            let ve: Map<any, any>;
            if(typeof value !== 'undefined')
                ve = this._ave.get(attribute);

            if(ve)
            {
                const e = ve.get(value);
                if(e instanceof Array)
                    facts.push(...e.map<Fact>(e => [e, attribute, value]));

                else if(typeof e !== 'undefined')
                    facts.push([e, attribute, value]);
            }
            else
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
        body: Edb[]): { [K in keyof T]: any; }[]
    {
        return this.QueryRuleOptimised(
            head,
            body);
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

    private QueryRuleOptimised<T extends [any, ...any[]]>(
        head: T,
        body: Edb[]): { [K in keyof T]: any; }[]
    {
        return body.reduce(
            (substitutions, atom) =>
            {
                if(typeof atom === 'function')
                    return [...atom(substitutions)];

                let count = substitutions.length;

                let boundVariables = substitutions.length ? substitutions[0] : {};
                let [entity, attribute, value] = atom;
                if(IsVariable(entity) && IsConstant(attribute) && entity in boundVariables && this._aev.has(attribute))
                {
                    let ev = this._aev.get(attribute);
                    while(count--)
                    {
                        const substitution = substitutions.shift();
                        const v = ev.get(substitution[entity])
                        if(v instanceof Array)
                            v.forEach(
                                v =>
                                {
                                    if(typeof value === 'undefined')
                                        substitutions.push(substitution);

                                    else if(IsConstant(value) && v === value)
                                        substitutions.push(substitution);

                                    else if(IsVariable(value))
                                    {
                                        if(typeof substitution[value] === 'undefined')
                                            substitutions.push({ ...substitution, [value]: v });

                                        else if(substitution[value] === v)
                                            substitutions.push(substitution);
                                    }

                                })
                        else if(typeof v !== 'undefined')
                        {

                            if(typeof value === 'undefined')
                                substitutions.push(substitution);

                            else if(IsConstant(value) && v === value)
                                substitutions.push(substitution);

                            else if(IsVariable(value))
                            {
                                if(typeof substitution[value] === 'undefined')
                                    substitutions.push({ ...substitution, [value]: v });

                                else if(substitution[value] === v)
                                    substitutions.push(substitution);
                            }
                        }
                    }
                }
                else if(IsVariable(value) && IsConstant(attribute) && value in boundVariables && this._ave.has(attribute))
                {
                    let ve = this._ave.get(attribute);
                    while(count--)
                    {
                        const substitution = substitutions.shift();
                        const e = ve.get(substitution[value])
                        if(e instanceof Array)
                            e.forEach(
                                e =>
                                {
                                    if(typeof entity === 'undefined')
                                        substitutions.push(substitution);

                                    else if(IsConstant(entity) && e === entity)
                                        substitutions.push(substitution);

                                    else if(IsVariable(entity))
                                    {
                                        if(typeof substitution[entity] === 'undefined')
                                            substitutions.push({ ...substitution, [entity]: e });

                                        else if(substitution[entity] === e)
                                            substitutions.push(substitution);
                                    }

                                })
                        else if(typeof e !== 'undefined')
                        {
                            if(typeof entity === 'undefined')
                                substitutions.push(substitution);

                            else if(IsConstant(entity) && e === entity)
                                substitutions.push(substitution);

                            else if(IsVariable(entity))
                            {
                                if(typeof substitution[entity] === 'undefined')
                                    substitutions.push({ ...substitution, [entity]: e });

                                else if(substitution[entity] === e)
                                    substitutions.push(substitution);
                            }
                        }
                    }
                }
                else while(count--)
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
                let topic = this._atomTopics.get(atom);
                if(!topic)
                {
                    topic = new Topic(
                        atom,
                        () => this.QueryAtom(atom));

                    this._atomTopics.set(
                        atom,
                        topic);
                }

                let topicSubscriber = (facts: Fact[]) => subscriber.next(facts);
                topic.Subscribers.add(topicSubscriber);

                subscriber.add(
                    () =>
                    {
                        topic.Subscribers.delete(topicSubscriber);
                        if(!topic.Subscribers.size)
                            this._atomTopics.delete(topic.Id);
                    });

                topicSubscriber(topic.Publisher());
            });
    }

    private ObserveRule<T extends [any, ...any[]]>(
        head: T,
        body: Edb[]): Observable<{ [K in keyof T]: any; }[]>
    {
        //return <Observable<any>>combineLatest(
        //    body.map<Observable<any>>(atom =>
        //        atom instanceof Function ? new BehaviorSubject(atom) : this.ObserveAtom(<Fact>atom).pipe(map(EavStore.Substitute(atom)))),
        //    EavStore.Conjunction(head));

        return new Observable<{ [K in keyof T]: any; }[]>(
            subscriber =>
            {
                const signal =  this.SignalScheduler.AddSignal(
                    result => subscriber.next(result),
                    [(<IEavStore>this).Signal(head, body)]);

                subscriber.add(() => this.SignalScheduler.RemoveSignal(signal));
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

        let topic = this._atomTopics.get(atom);
        if(!topic)
        {
            topic = new Topic(
                atom,
                () => this.QueryAtom(atom));

            this._atomTopics.set(
                atom,
                topic);
        }

        const signal = this.SignalScheduler.AddSignal();
        let topicSubscriber = (facts: Fact[]) => this.SignalScheduler.Inject(
            signal,
            facts);
        topic.Subscribers.add(topicSubscriber);

        signal.AddRemoveAction(
            () =>
            {
                topic.Subscribers.delete(topicSubscriber);
                if(!topic.Subscribers.size)
                    this._atomTopics.delete(topic.Id);
            });

        topicSubscriber(topic.Publisher());
        return signal;
    }

    private SignalRule<T extends [any, ...any[]]>(
        head: T,
        body: Atom[],
        ...rules: Rule[]): Signal<{ [K in keyof T]: any; }[]>
    {
        rules = [[<Idb>['', ...head], body], ...rules];

        const rulesGroupedByPredicateSymbol = Group(
            rules,
            rule => rule[0][0],
            rule => rule);

        const rulePredecessors = new Map(
            rules.map<[string, string[]]>(
                rule => [
                    rule[0][0],
                    [].concat(...rulesGroupedByPredicateSymbol.get(rule[0][0]).map(rule => rule[1].filter(IsIdb).map(idb => idb[0])))]));
        const ruleSuccessors = Transpose(rulePredecessors);

        type SCC<T> = ReadonlyArray<T> & { Recursive?: boolean; };
        const stronglyConnectedComponents: SCC<string>[] = StronglyConnectedComponents(rulePredecessors);
        stronglyConnectedComponents.forEach(scc => scc.Recursive = scc.length > 1 || rulePredecessors.get(scc[0]).includes(scc[0]));

        const signalAdjacencyList = new Map<Signal, Signal[]>();
        const idbSignals = new Map<string, Signal<Iterable<Tuple>>>();
        const signalPredecessorAtoms = new Map<Signal, (Fact | Idb)[]>();

        for(const stronglyConnectedComponent of stronglyConnectedComponents.values())
        {
            if(stronglyConnectedComponent.Recursive)
            {
                let recursion: (...inputs: Iterable<Tuple>[]) => Map<string, SortedSet<Tuple>>;
                let predecessorAtoms: (Fact | Idb)[];
                [recursion, predecessorAtoms]
                    = EavStore.Recursion(new Map(stronglyConnectedComponent
                        .map(predicateSymbol =>
                            <[string, Rule[]]>[predicateSymbol, rulesGroupedByPredicateSymbol
                                .get(predicateSymbol)
                                .filter(rule => stronglyConnectedComponent.includes(rule[0][0]))])));
                const recursionSignal = new Signal(recursion);
                signalPredecessorAtoms.set(
                    recursionSignal,
                    predecessorAtoms);
                stronglyConnectedComponent
                    .filter(predicateSymbol => predicateSymbol === '' || ruleSuccessors.get(predicateSymbol).length)
                    .forEach(predicateSymbol =>
                    {
                        const signal = new Signal((recursionOutput: Map<string, SortedSet<Tuple>>) => <Tuple[]>recursionOutput.get(predicateSymbol).Array);
                        signalAdjacencyList.set(
                            signal,
                            [recursionSignal])
                        idbSignals.set(
                            predicateSymbol,
                            signal);
                    });
            }
            else
            {
                const predicateSymbol = stronglyConnectedComponent[0];
                const rules = rulesGroupedByPredicateSymbol.get(predicateSymbol);
                if(rules.length === 1)
                {
                    const rule = rules[0];
                    const conjunction = new Signal(EavStore.Conjunction1(
                        rule[0][0] === '' ? rule[0].slice(1) : rule[0],
                        rule[1]));
                    idbSignals.set(
                        predicateSymbol,
                        conjunction);
                    signalPredecessorAtoms.set(
                        conjunction,
                        rule[1].filter((rule): rule is Fact | Idb => typeof rule !== 'function'));
                }
                else // Disjunction of conjunctions.
                {
                    const disjunction = new Signal(EavStore.Disjunction);
                    idbSignals.set(
                        predicateSymbol,
                        disjunction);
                    const predecessors: Signal[] = [];
                    signalAdjacencyList.set(
                        disjunction,
                        predecessors);

                    for(const rule of rules)
                    {
                        const conjunction = new Signal(EavStore.Conjunction1(
                            rule[0][0] === '' ? rule[0].slice(1) : rule[0],
                            rule[1]));
                        predecessors.push(conjunction);
                        signalPredecessorAtoms.set(
                            conjunction,
                            rule[1].filter((rule): rule is Fact | Idb => typeof rule !== 'function'));
                    }
                }
            }
        }

        for(const [signal, predecessorAtoms] of signalPredecessorAtoms)
        {
            const predecessors: Signal[] = [];
            signalAdjacencyList.set(
                signal,
                predecessors);
            for(const atom of predecessorAtoms)
                if(IsIdb(atom))
                    predecessors.push(idbSignals.get(atom[0]));

                else 
                    predecessors.push(this.SignalAtom(atom));
        }

        this.SignalScheduler.AddSignals(signalAdjacencyList);
        return <Signal>idbSignals.get('');
    }

    private SignalRule1<T extends [any, ...any[]]>(
        head: T,
        body: Atom[],
        ...rules: Rule[]): Signal<{ [K in keyof T]: any; }[]>
    {
        rules = [[<Idb>['', ...head], body], ...rules];

        const rulesGroupedByPredicateSymbol = Group(
            rules,
            rule => rule[0][0],
            rule => rule);

        const rulePredecessors = new Map(
            rules.map<[string, string[]]>(
                rule => [
                    rule[0][0],
                    [].concat(...rulesGroupedByPredicateSymbol.get(rule[0][0]).map(rule => rule[1].filter(IsIdb).map(idb => idb[0])))]));

        type SCC<T> = ReadonlyArray<T> & { Recursive?: boolean; };
        const stronglyConnectedComponents = new Map<string, SCC<string>>([].concat(
            ...StronglyConnectedComponents(rulePredecessors).map(scc => scc.map(predicateSymbol => <[string, SCC<string>]>[predicateSymbol, scc]))));

        stronglyConnectedComponents.forEach(scc => scc.Recursive = scc.length > 1 || rulePredecessors.get(scc[0]).includes(scc[0]));

        const signalAdjacencyList = new Map<Signal, Signal[]>();
        const idbSignals = new Map<string, Signal<Iterable<Tuple>>>();
        const signalPredecessorAtoms = new Map<Signal, (Fact | Idb)[]>();

        for(const [predicateSymbol, rules] of rulesGroupedByPredicateSymbol)
        {
            if(stronglyConnectedComponents.get(predicateSymbol).Recursive)
            {
                let recursiveDisjunction: (...inputs: [SortedSet<Tuple>, ...Iterable<Tuple>[]]) => SortedSet<Tuple>;
                let predecessorAtoms: (Fact | Idb)[];
                [recursiveDisjunction, predecessorAtoms] = EavStore.RecursiveDisjunction(rules);
                const recursiveSignal = new Signal(
                    recursiveDisjunction,
                    (lhs, rhs) => lhs && rhs && lhs.size === rhs.size);
                signalAdjacencyList.set(
                    recursiveSignal,
                    [recursiveSignal]);
                signalPredecessorAtoms.set(
                    recursiveSignal,
                    predecessorAtoms);
                idbSignals.set(
                    predicateSymbol,
                    recursiveSignal);
            }
            else
            {
                if(rules.length === 1)
                {
                    const rule = rules[0];
                    const conjunction = new Signal(EavStore.Conjunction1(
                        rule[0][0] === '' ? rule[0].slice(1) : rule[0],
                        rule[1]));
                    signalAdjacencyList.set(
                        conjunction,
                        []);
                    signalPredecessorAtoms.set(
                        conjunction,
                        rule[1].filter((rule): rule is Fact | Idb => typeof rule !== 'function'));
                    idbSignals.set(
                        predicateSymbol,
                        conjunction);
                }
                else // Disjunction of conjunctions.
                {
                    const disjunction = new Signal(EavStore.Disjunction);
                    const predecessors: Signal[] = [];
                    signalAdjacencyList.set(
                        disjunction,
                        predecessors);
                    idbSignals.set(
                        predicateSymbol,
                        disjunction);

                    for(const rule of rules)
                    {
                        const conjunction = new Signal(EavStore.Conjunction1(
                            rule[0][0] === '' ? rule[0].slice(1) : rule[0],
                            rule[1]));
                        predecessors.push(conjunction);
                        signalAdjacencyList.set(
                            conjunction,
                            []);
                        signalPredecessorAtoms.set(
                            conjunction,
                            rule[1].filter((rule): rule is Fact | Idb => typeof rule !== 'function'));
                    }
                }
            }
        }

        for(const [signal, predecessorAtoms] of signalPredecessorAtoms)
        {
            const predecessors: Signal[] = signalAdjacencyList.get(signal);
            for(const atom of predecessorAtoms)
                if(IsIdb(atom))
                    predecessors.push(idbSignals.get(atom[0]));

                else
                    predecessors.push(this.SignalAtom(atom));
        }

        this.SignalScheduler.AddSignals(signalAdjacencyList);
        return <Signal>idbSignals.get('');
    }

    static Substitute(
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

    static Match(
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
                    if(IsConstant(term))
                    {
                        if(term !== tuple[index])
                            substitution = null;
                    }
                    else if(IsVariable(term))
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

    static Conjunction(): (...inputs: (object[] | BuiltIn)[]) => object[];
    static Conjunction(terms: any[]): (...inputs: (object[] | BuiltIn)[]) => Tuple[];
    static Conjunction(terms: any[], idbTerms: any[]): (...inputs: (object[] | BuiltIn)[]) => object[];
    static Conjunction(
        terms?: any[],
        idbTerms?: any[]
        ): (...inputs: (object[] | BuiltIn)[]) => object[]
    {
        let initialSubstitution: object = {};
        const initialMappedSubstitution = {};

        let map: (substitutions: object[]) => object[] = substitutions => substitutions;
        if(terms)
        {
            if(!idbTerms)
                map = substitutions => substitutions.map(substitution => terms.map(term => (IsVariable(term) && term in substitution) ? substitution[term] : term));

            else
            {
                const variableMap: [PropertyKey, PropertyKey][] = [];
                for(let index = 0; index < terms.length && initialSubstitution; index++)
                {
                    const term = terms[index];
                    const idbTerm = idbTerms[index];

                    if(IsVariable(term))
                    {
                        if(IsConstant(idbTerm))
                        {
                            if(initialSubstitution[term] === undefined)
                                initialSubstitution[term] = idbTerm;

                            else if(initialSubstitution[term] !== idbTerm)
                                return () => [];
                        }
                        else if(IsVariable(idbTerm))
                            variableMap.push([term, idbTerm]);
                    }
                    else if(IsConstant(term))
                    {
                        if(IsVariable(idbTerm))
                        {
                            if(initialMappedSubstitution[idbTerm] === undefined)
                                initialMappedSubstitution[idbTerm] = term;

                            else if(initialMappedSubstitution[idbTerm] !== term)
                                return () => [];
                        }
                        else if(IsConstant(idbTerm) && term !== idbTerm)
                            return () => [];
                    }
                }

                map = (substitutions: object[]) =>
                {
                    const mappedSubstitutions: object[] = [];
                    for(const substitution of substitutions)
                    {
                        let mappedSubstitution = { ...initialMappedSubstitution };
                        for(const [source, target] of variableMap)
                        {
                            if(mappedSubstitution[target] === undefined)
                                mappedSubstitution[target] = substitution[source];

                            else if(mappedSubstitution[target] !== substitution[source])
                            {
                                mappedSubstitution = null;
                                break;
                            }
                        }

                        if(mappedSubstitution)
                            mappedSubstitutions.push(mappedSubstitution);
                    }
                    return mappedSubstitutions;
                };
            }
        }

        return (...inputs: (object[] | Function)[]) => map(inputs.reduce<object[]>(
            (substitutions, input) =>
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
            [initialSubstitution]));
    }

    static Conjunction1(
        head: any[],
        body: Atom[]): (...inputs: Iterable<Tuple>[]) => Iterable<Tuple>
    {
        return (...inputs: Iterable<Tuple>[]): Iterable<Tuple> =>
        {
            let inputIndex = 0;
            return body.reduce(
                (substitutions, atom) =>
                {
                    if(typeof atom === 'function')
                        return [...atom(substitutions)];

                    let count = substitutions.length;
                    while(count--)
                    {
                        const substitution = substitutions.shift();
                        for(const tuple of inputs[inputIndex])
                        {
                            let merged = { ...substitution };
                            for(let index = 0; index < atom.length && merged; ++index)
                            {
                                const term = atom[index];
                                if(IsConstant(term))
                                {
                                    if(term !== tuple[index])
                                        merged = null;
                                }
                                else if(IsVariable(term))
                                {
                                    if(typeof merged[term] === 'undefined')
                                        merged[term] = tuple[index];

                                    else if(merged[term] !== tuple[index])
                                        // Fact does not match query pattern.
                                        merged = null;
                                }
                            }

                            if(merged)
                                substitutions.push(merged);
                        }
                    }

                    ++inputIndex;
                    return substitutions;
                },
                [{}]).map(substitution => head.map(term => (IsVariable(term) && term in substitution) ? substitution[term] : term));
        };
    }

    static Disjunction(
        ...inputs: Iterable<Tuple>[]
        ): SortedSet<Tuple>
    {
        let set = new SortedSet(tupleCompare);
        for(const input of inputs)
            for(const tuple of input)
                set.add(tuple)
        return set;
    }

    static RecursiveDisjunction(
        rules: Rule[]
        ): [(...inputs: [SortedSet<Tuple>, ...Iterable<Tuple>[]]) => SortedSet<Tuple>, (Fact | Idb)[]]
    {
        type InputType = [SortedSet<Tuple>, ...Iterable<Tuple>[]];
        const wrappedInputs = new ArrayKeyedMap<Fact | Idb, () => Iterable<Tuple>>();
        const inputAtoms: (Fact | Idb)[] = [];
        let inputs: InputType;

        const disjunction = (...params: InputType): SortedSet<Tuple> =>
        {
            const [resultTMinus1, ...conjunctions] = params;
            const resultT = new SortedSet(resultTMinus1);
            for(const conjunction of conjunctions)
                for(const tuple of conjunction)
                    resultT.add(tuple);

            return resultT;
        };

        const disjunctionPredecessors: [() => SortedSet<Tuple>, ...(() => Iterable<Tuple>)[]] = [() => inputs[0] || new SortedSet(tupleCompare)];

        for(const rule of rules)
        {
            const conjunction = EavStore.Conjunction1(
                rule[0][0] === '' ? rule[0].slice(1) : rule[0],
                rule[1]);
            const conjunctionPredecessors: (() => Iterable<Tuple>)[] = [];

            for(const atom of rule[1].filter((rule): rule is Fact | Idb => typeof rule !== 'function'))
            {
                let wrappedInput: () => Iterable<Tuple>;
                if(IsIdb(atom) && atom[0] === rule[0][0])
                    wrappedInput = disjunctionPredecessors[0];

                else
                {
                    wrappedInput = wrappedInputs.get(atom);
                    if(!wrappedInput)
                    {
                        const index = inputAtoms.push(atom);
                        wrappedInput = () => inputs[index];
                        wrappedInputs.set(
                            atom,
                            wrappedInput);
                    }
                }

                conjunctionPredecessors.push(wrappedInput);
            }

            const wrappedConjunction = Wrap(conjunction, ...conjunctionPredecessors);
            disjunctionPredecessors.push(wrappedConjunction);
        }

        const wrappedDisjunction = Wrap(disjunction, ...disjunctionPredecessors);

        return [
            (...params: InputType): SortedSet<Tuple> =>
            {
                inputs = params;
                return wrappedDisjunction();
            },
            inputAtoms];
    }

    static Recursion(
        rulesGroupedByPredicateSymbol: Map<string, Rule[]>
        ): [(...inputs: Iterable<Tuple>[]) => Map<string, SortedSet<Tuple>>, (Fact | Idb)[]]
    {
        const signalAdjacencyList = new Map<Signal, Signal[]>();
        const empty = new SortedSet(tupleCompare);
        const resultT0 = new Map([...rulesGroupedByPredicateSymbol.keys()].map(([predicateSymbol,]) => [predicateSymbol, empty]));
        const resultTMinus1Signal = new Signal<Map<string, SortedSet<Tuple>>>();
        signalAdjacencyList.set(resultTMinus1Signal, []);
        const resultTMinus1Signals = new Map<string, Signal<SortedSet<Tuple>>>(
            [...rulesGroupedByPredicateSymbol.keys()].map(
                predicateSymbol => [predicateSymbol, new Signal((resultMinus1: Map<string, SortedSet<Tuple>>) => resultMinus1.get(predicateSymbol))]))
        resultTMinus1Signals.forEach(signal => signalAdjacencyList.set(signal, [resultTMinus1Signal]));
        const inputSignals = new ArrayKeyedMap<Fact | Idb, Signal<Iterable<Tuple>>>();
        const inputAtoms: (Fact | Idb)[] = [];

        const predecessors: Signal<[string, SortedSet<Tuple>]>[] = [];

        for(const [predicateSymbol, rules] of rulesGroupedByPredicateSymbol)
        {
            const disjunction = new Signal(
                (resultTMinus1: SortedSet<Tuple>, ...conjunctions: Iterable<Tuple>[]): [string, SortedSet<Tuple>] =>
                {
                    const resultT = new SortedSet(resultTMinus1);
                    for(const conjunction of conjunctions)
                        for(const tuple of conjunction)
                            resultT.add(tuple);

                    return [predicateSymbol, resultT];

                });

            predecessors.push(disjunction);
            const disjunctionPredecessors: Signal<Iterable<Tuple>>[] = [];

            for(const rule of rules)
            {
                const conjunction = new Signal(EavStore.Conjunction1(
                    rule[0][0] === '' ? rule[0].slice(1) : rule[0],
                    rule[1]));
                disjunctionPredecessors.push(conjunction);
                const conjunctionPredecessors: Signal<Iterable<Tuple>>[] = [];
                signalAdjacencyList.set(
                    conjunction,
                    conjunctionPredecessors)

                for(const atom of rule[1].filter((rule): rule is Fact | Idb => typeof rule !== 'function'))
                    if(IsIdb(atom) && resultTMinus1Signals.has(atom[0]))
                        conjunctionPredecessors.push(resultTMinus1Signals.get(atom[0]));

                    else
                    {
                        let inputSignal = inputSignals.get(atom);
                        if(!inputSignal)
                        {
                            inputSignal = new Signal();
                            signalAdjacencyList.set(
                                inputSignal,
                                []);

                            inputSignals.set(
                                atom,
                                inputSignal);
                            inputAtoms.push(atom);
                        }
                        conjunctionPredecessors.push(inputSignal);
                    }
            }

            signalAdjacencyList.set(
                disjunction,
                [resultTMinus1Signals.get(predicateSymbol), ...disjunctionPredecessors]);
        }

        let resultT: Map<string, SortedSet<Tuple>>;
        signalAdjacencyList.set(
            new Signal((...t: [string, SortedSet<Tuple>][]) => resultT = new Map(t)),
            predecessors);

        const scheduler: IScheduler = new Scheduler(signalAdjacencyList);
        return [(...inputs: Iterable<Tuple>[]): Map<string, SortedSet<Tuple>> =>
        {
            let resultTMinus1: Map<string, SortedSet<Tuple>> = resultT0;
            scheduler.Update(
                scheduler =>
                {
                    inputAtoms.forEach((atom, index) => scheduler.Inject(
                        inputSignals.get(atom),
                        inputs[index]));
                    scheduler.Inject(
                        resultTMinus1Signal,
                        resultTMinus1);
                });

            while([...resultT].some(([predicateSymbol, result]) => result.size !== resultTMinus1.get(predicateSymbol).size))
            {
                resultTMinus1 = resultT;
                scheduler.Update(
                    scheduler => scheduler.Inject(
                        resultTMinus1Signal,
                        resultTMinus1));
            }

            return resultT;
        }, inputAtoms];
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

        return this.SignalRule1(
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

        this.Publish(this._entitiesTopic);
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
                            this.Publish(this._entitiesTopic);
                        }));

            this.Publish(this._entitiesTopic);
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

    Publish(
        topic: Topic
        )
    {
        if(this._publishSuspended)
        {
            this._scheduledTopics.add(topic);
            return;
        };

        topic.Publish();
    }

    SuspendPublish(): void
    {
        ++this._publishSuspended;
    }

    UnsuspendPublish(): void
    {
        --this._publishSuspended;
        if(!this._publishSuspended)
        {
            try
            {
                this.SignalScheduler.Suspend();
                while(this._scheduledTopics.size)
                    this._scheduledTopics.shift().Publish();
            }
            finally
            {
                this.SignalScheduler.Resume();
            }
        }
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
            this._atomTopics,
            [entity, attribute, value],
            (atom, topic: Topic<Fact, Fact[]>) => this.Publish(topic));
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
            this._atomTopics,
            [entity, attribute, value],
            (atom, topic: Topic<Fact, Fact[]>) => this.Publish(topic));
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
            this._atomTopics,
            [entity, attribute, assertedValue],
            (atom, topic: Topic<Fact, Fact[]>) => this.Publish(topic));
        Match(
            this._atomTopics,
            [entity, attribute, retractedValue],
            (atom, topic: Topic<Fact, Fact[]>) => this.Publish(topic));
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
