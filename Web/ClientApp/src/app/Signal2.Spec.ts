import { } from 'jasmine';
import { Subscription } from 'rxjs';
import { assertBuilder } from './Ontology/assertBuilder';
import { BuiltIn } from './Ontology/Atom';
import { IsVariable } from './Ontology/EavStore';
import { SortedSet } from './Ontology/SortedSet';
import { Scheduler, Signal } from './Signal2';

type Tuple = [any, ...any[]];

type Comparer<T> = (a: T, b: T) => number;

function TupleComparer(
    elementComparer: Comparer<any>
    ): Comparer<Tuple>
{
    return function(
        a: Tuple,
        b: Tuple
        ): number
    {
        let result = a.length - b.length;
        for(let index = 0; index < a.length && result === 0; ++index)
            result = elementComparer(
                a[index],
                b[index]);

        return result;
    }
}

const empty = new Set<Tuple>();
const Union = (
    setBuilder: (tuple: Iterable<Tuple>) => Set<Tuple>
    ): (...iterables: Iterable<Tuple>[]) => Set<Tuple> =>
    (...iterables: Iterable<Tuple>[]): Set<Tuple> => iterables.reduce<Set<Tuple>>(
        (lhs, rhs) => rhs ? setBuilder([...lhs, ...rhs]) : lhs,
        empty);

const ConjunctiveQuery = <T extends Tuple> (
    head: T,
    body: (Tuple | BuiltIn)[]): (...relations: Tuple[][]) => { [K in keyof T]: any; }[] =>
    (...relations: Tuple[][]): { [K in keyof T]: any; }[] =>
    {
        let relationIndex = 0;
        return body.reduce<{}[]>(
            (substitutions, atom) =>
            {
                if(typeof atom === 'function')
                    return [...atom(substitutions)];

                let count = substitutions.length;
                while(count--)
                {
                    const substitution = substitutions.shift();
                    for(const fact of relations[relationIndex] || empty)
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

                ++relationIndex;
                return substitutions;
            },
            [{}]).map(substitution => <{ [K in keyof T]: any; }>head.map(term => (IsVariable(term) && term in substitution) ? substitution[term] : term));
    };

const ConjunctiveQueryDistinct = <T extends Tuple>(
    setBuilder: (tuple: Iterable<{ [K in keyof T]: any; }>) => Set<{ [K in keyof T]: any; }>,
    head: T,
    body: (Tuple | BuiltIn)[]): (thisArg: any, relations: Tuple[][]) => Set<{ [K in keyof T]: any; }> =>
{
    const query = ConjunctiveQuery(
        head,
        body);

    return (...relations: Tuple[][]): Set<{ [K in keyof T]: any; }> => setBuilder(query(...relations));
}

describe(
    'Signal2',
    () =>
    {

        let trace: { Signal: Signal, Value: number }[] = [];
        let subscriptions: Subscription[] = [];

        describe(
            `Given,
s1 = new Signal(() => s1Value),
s2 = new Signal(() => s2Value),
s3 = new Signal((...numbers: number[]) => numbers.reduce((total, current) => total + current, 0)),
graph = new Map([[s1, []], [s2, []], [s3, [s1, s2]]]) and
scheduler = new Scheduler(graph):`,
            () =>
            {
                let trace: { Signal: Signal, Value: number }[] = [];
                let s1Value = 1;
                let s2Value = 2
                const s1 = new Signal(() => s1Value);
                const s2 = new Signal(() => s2Value);
                const s3 = new Signal((...numbers: number[]) => numbers.reduce((total, current) => total + current, 0));

                const graph = new Map([
                    [s1, []],
                    [s2, []],
                    [s3, [s1, s2]]]);
                const scheduler = new Scheduler(
                    graph,
                    (signal, value) => trace.push({ Signal: signal, Value: value }));

                const assert = assertBuilder('trace', 's1', 's2', 's3')(trace, s1, s2, s3);
                assert('s1.LongestPath === 0');
                assert('s2.LongestPath === 0');
                assert('s3.LongestPath === 1');
                assert('trace.slice(0, 2).find(t => t.Signal === s1).Value == 1');
                assert('trace.slice(0, 2).find(t => t.Signal === s2).Value == 2');
                assert('trace[2].Signal === s3');
                assert('trace[2].Value  === 3' );

                describe(
                    'Given scheduler.Update(s => { s1Value = 3; s.Schedule(s1); }):',
                    () =>
                    {
                        scheduler.Update(s =>
                        {
                            s1Value = 3;
                            s.Schedule(s1);
                        });

                        assert('trace[3].Signal === s1');
                        assert('trace[3].Value  === 3' );
                        assert('trace[4].Signal === s3');
                        assert('trace[4].Value  === 5' );
                        assert('trace.length    === 5' );
                    });
            });
        subscriptions.forEach(subscription => subscription.unsubscribe());

        trace = [];
        subscriptions = [];

        describe(
            `Given,
s1 = new Signal(() => s1Value),
s2 = new Signal(() => s2Value),
s3 = new Signal(() => s3Value),
s4 = new Signal((...numbers: number[]) => numbers.reduce((total, current) => total + current, 0)),
s5 = new Signal(s4.Function),
graph = new Map([[s1, []], [s2, []], [s3, []], [s4, [s1, s2]], [s5, [s3, s4]]]) and
scheduler = new Scheduler(graph):`,
            () =>
            {
                let trace: { Signal: Signal, Value: number }[] = [];
                let s1Value = 1;
                let s2Value = 2
                let s3Value = 3
                const s1 = new Signal(() => s1Value);
                const s2 = new Signal(() => s2Value);
                const s3 = new Signal(() => s3Value);
                const s4 = new Signal((...numbers: number[]) => numbers.reduce((total, current) => total + current, 0));
                const s5 = new Signal(s4.Function);

                const graph = new Map([
                    [s1, []],
                    [s2, []],
                    [s3, []],
                    [s4, [s1, s2]],
                    [s5, [s3, s4]]]);
                const scheduler = new Scheduler(
                    graph,
                    (signal, value) => trace.push({ Signal: signal, Value: value }));
                const assert = assertBuilder('trace', 's1', 's2', 's3', 's4', 's5')(trace, s1, s2, s3, s4, s5);
                assert('s1.LongestPath === 0');
                assert('s2.LongestPath === 0');
                assert('s3.LongestPath === 0');
                assert('s4.LongestPath === 1');
                assert('s5.LongestPath === 2');
                assert('trace.slice(0, 3).find(t => t.Signal === s1).Value == 1');
                assert('trace.slice(0, 3).find(t => t.Signal === s2).Value == 2');
                assert('trace.slice(0, 3).find(t => t.Signal === s3).Value == 3');
                assert('trace[3].Signal === s4');
                assert('trace[3].Value  === 3' );
                assert('trace[4].Signal === s5');
                assert('trace[4].Value  === 6' );

                describe(
                    'Given scheduler.Update(s => { s1Value = 3; s.Schedule(s1); }):',
                    () =>
                    {
                        scheduler.Update(s =>
                        {
                            s1Value = 5;
                            s.Schedule(s1);
                        });
                        assert('trace[5].Signal === s1');
                        assert('trace[5].Value  === 5' );
                        assert('trace[6].Signal === s4');
                        assert('trace[6].Value  === 7' );
                        assert('trace[7].Signal === s5');
                        assert('trace[7].Value  === 10');
                        assert('trace.length    === 8' );
                    });
            });
        subscriptions.forEach(subscription => subscription.unsubscribe());

        trace = [];
        subscriptions = [];

        describe(
            `Recursion:
T(x, y) : - R(x, y),
T(x, y) : - R(x, z), T(z, y)`,
            () =>
            {
                let trace: { Signal: Signal, Value: undefined | Iterable<Tuple> }[] = [];
                const elementComparer = (a: number, b: number) => a - b;
                const tupleComparer = TupleComparer(elementComparer);
                const setBuilder = (tuples: Iterable<any>): Set<any> => new SortedSet(
                    tupleComparer,
                    tuples);
                const union = Union(setBuilder);
                const query = ConjunctiveQueryDistinct(
                    setBuilder,
                    ['?x', '?y'],
                    [['?x', '?z'], ['?z', '?y']]);

                function AreEqual<T>(
                    lhs: Set<T>,
                    rhs: Set<T>
                    )
                {
                    if(!(lhs && rhs && lhs.size === rhs.size))
                        return false;

                    for(const a of lhs)
                        if(!rhs.has(a))
                            return false;

                    return true;
                }

                const RValues = [
                    [
                        [1, 2],
                        [2, 1],
                        [2, 3],
                        [1, 4],
                        [3, 4],
                        [4, 5]
                    ],
                    [
                        [1, 2],
                        [2, 3]
                    ],
                    []
                ];

                const TValues: [number, number][][] = [
                    [
                        [1, 2],
                        [2, 1],
                        [2, 3],
                        [1, 4],
                        [3, 4],
                        [4, 5],
                        [1, 1],
                        [2, 2],
                        [1, 3],
                        [2, 4],
                        [1, 5],
                        [3, 5],
                        [2, 5]
                    ],
                    [
                        [1, 2],
                        [2, 3],
                        [1, 3]
                    ],
                    []
                ];

                TValues.forEach(values => values.sort(tupleComparer));

                let RValue = RValues[0];
                const R = new Signal(() => RValue);
                const T = new Signal(union, AreEqual);
                const Q = new Signal(query, AreEqual);

                const graph = new Map([
                    [R, []],
                    [T, [T.CurrentValue(), R, Q]],
                    [Q, [R, T]]]);

                const scheduler = new Scheduler(
                    graph,
                    (signal, value) => trace.push({ Signal: signal, Value: value }));
                const assert = assertBuilder('trace', 'R', 'T', 'Q')(trace, R, T, Q);

                for(let index = 1; index < RValues.length;++index)
                    scheduler.Update(
                        s =>
                        {
                            RValue = RValues[index];
                            s.Schedule(R);
                        });

                assert('R.LongestPath === 0');
                assert('T.LongestPath === 1');
                assert('Q.LongestPath === 1');

                for(const traceItem of trace)
                    console.log(`${traceItem.Signal === T ? 'T' : traceItem.Signal === Q ? 'Q' : 'R'}: ${JSON.stringify(traceItem.Value ? [...traceItem.Value] : traceItem.Value)}`);

                const values = trace.filter(t => t.Signal === T).map(t => t.Value);;

                for(let index = 0; index < RValues.length; ++index)
                    describe(
                        `Given R: ${JSON.stringify(RValues[index])}`,
                        () =>
                        {
                            it(
                              `The expected value of T is ${JSON.stringify(TValues[index])}`,
                              () => expect(JSON.stringify([...values[index]])).toBe(JSON.stringify(TValues[index])));
                        });
            });
    });
