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
        for(let index = 1; index < a.length && result === 0; ++index)
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
    body: (Tuple | BuiltIn)[]): (relations: Tuple[][]) => { [K in keyof T]: any; }[] =>
    (relations: Tuple[][]): { [K in keyof T]: any; }[] =>
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
    body: (Tuple | BuiltIn)[]): (relations: Tuple[][]) => Set<{ [K in keyof T]: any; }> =>
{
    const query = ConjunctiveQuery(
        head,
        body);

    return (relations: Tuple[][]): Set<{ [K in keyof T]: any; }> => setBuilder(query(relations));
}

describe(
    'Signal2',
    () =>
    {

        let trace: { Signal: Signal, Value: number }[] = [];
        let subscriptions: Subscription[] = [];

        describe(
            `Given,
s1 = {},
s2 = {},
s3 = { Map: (...numbers: number[]) => numbers.reduce((total, current) => total + current, 0) },
graph = new Map([[s1, [s3]], [s2, [s3]], [s3, [  ]]]) and
scheduler = new Scheduler(graph):`,
            () =>
            {
                const s1: Signal = {};
                const s2: Signal = {};
                const s3: Signal = { Map: (...numbers: number[]) => numbers.reduce((total, current) => total + current, 0) };

                const graph = new Map([
                    [s1, []],
                    [s2, []],
                    [s3, [s1, s2]]]);
                const scheduler = new Scheduler(graph);
                subscriptions = [...graph.keys()].map(signal => scheduler.Observe<number>(signal).subscribe(value => trace.push({ Signal: signal, Value: value })));
                const assert = assertBuilder('trace', 's1', 's2', 's3')(trace, s1, s2, s3);
                assert('s1.LongestPath === 0');
                assert('s2.LongestPath === 0');
                assert('s3.LongestPath === 1');

                assert('trace[0].Signal === s1'       );
                assert('trace[0].Value  === undefined');
                assert('trace[1].Signal === s2'       );
                assert('trace[1].Value  === undefined');
                assert('trace[2].Signal === s3'       );
                assert('trace[2].Value  === undefined');

                describe(
                    'Given scheduler.Update(s => { s1.Update(s1, 1); s2.Update(s2, 2); }):',
                    () =>
                    {
                        scheduler.Update(s =>
                        {
                            s.SetValue(s1, 1);
                            s.SetValue(s2, 2);
                        });
                        assert('trace[3].Signal === s1');
                        assert('trace[3].Value  === 1' );
                        assert('trace[4].Signal === s2');
                        assert('trace[4].Value  === 2' );
                        assert('trace[5].Signal === s3');
                        assert('trace[5].Value  === 3' );
                        assert('trace.length    === 6' );
                    });
            });
        subscriptions.forEach(subscription => subscription.unsubscribe());

        trace = [];
        subscriptions = [];

        describe(
            `Given,
s1 = {},
s2 = {},
s3 = {},
s4 = { Map: (...numbers: number[]) => numbers.reduce((total, current) => total + current, 0) },
s5 = { Map: s4.Map },
graph = new Map([[s1, [s4]], [s2, [s4]], [s3, [s5]], [s4, [s5]], [s5, [  ]]]) and
scheduler = new Scheduler(graph):`,
            () =>
            {
                const s1: Signal = {};
                const s2: Signal = {};
                const s3: Signal = {};
                const s4: Signal = { Map: (...numbers: number[]) => numbers.reduce((total, current) => total + current, 0) };
                const s5: Signal = { Map: s4.Map };

                const graph = new Map([
                    [s1, []],
                    [s2, []],
                    [s3, []],
                    [s4, [s1, s2]],
                    [s5, [s3, s4]]]);
                const scheduler = new Scheduler(graph);
                subscriptions = [...graph.keys()].map(signal => scheduler.Observe<number>(signal).subscribe(value => trace.push({ Signal: signal, Value: value })));
                const assert = assertBuilder('trace', 's1', 's2', 's3', 's4', 's5')(trace, s1, s2, s3, s4, s5);
                assert('s1.LongestPath === 0');
                assert('s2.LongestPath === 0');
                assert('s3.LongestPath === 0');
                assert('s4.LongestPath === 1');
                assert('s5.LongestPath === 2');
                assert('trace[0].Signal === s1'        );
                assert('trace[0].Value  === undefined' );
                assert('trace[1].Signal === s2'        );
                assert('trace[1].Value  === undefined' );
                assert('trace[2].Signal === s3'        );
                assert('trace[2].Value  === undefined' );
                assert('trace[3].Signal === s4'        );
                assert('trace[3].Value  === undefined' );
                assert('trace[4].Signal === s5'        );
                assert('trace[4].Value  === undefined' );

                describe(
                    'Given scheduler.Update(s => { s3.Update(4, s); s1.Update(2, s); }):',
                    () =>
                    {
                        scheduler.Update(s =>
                        {
                            s.SetValue(s1, 1);
                            s.SetValue(s2, 2);
                            s.SetValue(s3, 3);
                        });
                        assert('trace[5].Signal === s1');
                        assert('trace[5].Value  === 1' );
                        assert('trace[6].Signal === s2');
                        assert('trace[6].Value  === 2' );
                        assert('trace[7].Signal === s3');
                        assert('trace[7].Value  === 3' );
                        assert('trace[8].Signal === s4');
                        assert('trace[8].Value  === 3' );
                        assert('trace[9].Signal === s5');
                        assert('trace[9].Value  === 6' );
                        assert('trace.length    === 10');
                    });
            });
        subscriptions.forEach(subscription => subscription.unsubscribe());

        trace = [];
        subscriptions = [];

        describe(
            'Recursion',
            () =>
            {
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

                const R = [
                    [1, 2],
                    [2, 1],
                    [2, 3],
                    [1, 4],
                    [3, 4],
                    [4, 5]
                ];

                const RSignal: Signal = {};
                const TSignal: Signal = { Map: union, AreEqual: AreEqual };
                const QSignal: Signal = {
                    Map: query,
                    AreEqual: AreEqual
                };

                const graph = new Map([
                    [RSignal, []],
                    [TSignal, [TSignal, RSignal, QSignal]],
                    [QSignal, [TSignal, RSignal]]]);

                const scheduler = new Scheduler(graph);
                subscriptions = [...graph.keys()].map(signal => scheduler.Observe<number>(signal).subscribe(value => trace.push({ Signal: signal, Value: value })));
                const assert = assertBuilder('trace', 'RSignal', 'TSignal', 'QSignal')(trace, RSignal, TSignal, QSignal);
                assert('RSignal.LongestPath === 0');
                assert('TSignal.LongestPath === 1');
                assert('QSignal.LongestPath === 1');
            });
    });
