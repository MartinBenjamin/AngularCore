import { } from 'jasmine';
import { assertBuilder } from './Ontology/assertBuilder';
import { Scheduler, Signal } from './Signal2';
import { Observable, Subscription } from 'rxjs';


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
                    [s1, [s3]],
                    [s2, [s3]],
                    [s3, []]]);
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
                    [s1, [s4]],
                    [s2, [s4]],
                    [s3, [s5]],
                    [s4, [s5]],
                    [s5, [  ]]]);
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

    });
