import { } from 'jasmine';
import { assertBuilder } from '../assertBuilder';
import { SortedSet } from '../Collections/SortedSet';
import { BuiltIn } from '../EavStore/BuiltIn';
import { IsVariable } from '../EavStore/Datalog';
import { Scheduler, Signal } from './Signal';

type Tuple = [any, ...any[]];

type Comparer<T> = (a: T, b: T) => number;

function Reduce<T, TCurrent, TParams extends [any, ...any[]]>(
    reduce: (previous: T, current: TCurrent) => T,
    func: (...params: TParams) => TCurrent
    ): (initial: T, previous: T, ...params: TParams) => T
{
    return (initial: T, previous: T, ...params: TParams): T =>
        previous === undefined ? initial : reduce(previous, func(...params));
}

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
    body: (Tuple | BuiltIn)[]): (...relations: Iterable<Tuple>[]) => { [K in keyof T]: any; }[] =>
    (...relations: Iterable<Tuple>[]): { [K in keyof T]: any; }[] =>
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

describe(
    'Signal',
    () =>
    {
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
                    'Given scheduler.Inject(s1, 3):',
                    () =>
                    {
                        scheduler.Inject(s1, 3);

                        assert('trace[3].Signal === s1');
                        assert('trace[3].Value  === 3' );
                        assert('trace[4].Signal === s3');
                        assert('trace[4].Value  === 5' );
                        assert('trace.length    === 5' );
                    });
            });

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
                    'Given scheduler.Inject(s1, 5):',
                    () =>
                    {
                        scheduler.Inject(s1, 5);

                        assert('trace[5].Signal === s1');
                        assert('trace[5].Value  === 5' );
                        assert('trace[6].Signal === s4');
                        assert('trace[6].Value  === 7' );
                        assert('trace[7].Signal === s5');
                        assert('trace[7].Value  === 10');
                        assert('trace.length    === 8' );
                    });
            });
    });
