import { } from 'jasmine';
import { assertBuilder } from './Ontology/assertBuilder';
import { Signal, ISignal, Map, Scheduler, IScheduler } from './Signal';
import { Observable, Subscription } from 'rxjs';


describe(
    'Signal',
    () =>
    {
        let trace: { Signal: ISignal<number>, Value: number }[] = [];
        let subscriptions: Subscription[] = [];

        describe(
            'Given scheduler = new Scheduler(), s1 = new Signal(1), s2 = new Signal(2) and s3 = Map(s1, s2, (n1, n2) => n1 + n2):',
            () =>
            {
                const scheduler = new Scheduler();
                const s1 = new Signal(1);
                const s2 = new Signal(2);
                const s3 = Map(s1, s2, (n1, n2) => n1 + n2);
                subscriptions.push(s1.Observe().subscribe(value => trace.push({ Signal: s1, Value: value })));
                subscriptions.push(s2.Observe().subscribe(value => trace.push({ Signal: s2, Value: value })));
                subscriptions.push(s3.Observe().subscribe(value => trace.push({ Signal: s3, Value: value })));
                const assert = assertBuilder('trace', 's1', 's2', 's3')(trace, s1, s2, s3);
                assert('trace[0].Signal === s1');
                assert('trace[0].Value  === 1' );
                assert('trace[1].Signal === s2');
                assert('trace[1].Value  === 2' );
                assert('trace[2].Signal === s3');
                assert('trace[2].Value  === 3' );

                describe(
                    'Given scheduler.Update(s => { s1.Update(2, s); s2.Update(3, s); }):',
                    () =>
                    {
                        scheduler.Update(s =>
                        {
                            s1.Update(2, s);
                            s2.Update(3, s);
                        });
                        assert('trace[3].Signal === s1');
                        assert('trace[3].Value  === 2' );
                        assert('trace[4].Signal === s2');
                        assert('trace[4].Value  === 3' );
                        assert('trace[5].Signal === s3');
                        assert('trace[5].Value  === 5' );
                        assert('trace.length    === 6' );
                    });
            });
        subscriptions.forEach(subscription => subscription.unsubscribe());

        trace = [];
        subscriptions = [];

        describe(
            'Given scheduler = new Scheduler(), s1 = new Signal(1), s2 = new Signal(2) and s3 = Map([s1, s2], (...n) => n.reduce((n1, n2) => n1 + n2, 0)):',
            () =>
            {
                const scheduler: IScheduler = new Scheduler();
                const s1 = new Signal(1);
                const s2 = new Signal(2);
                const s3 = Map([s1, s2], (...n) => n.reduce((n1, n2) => n1 + n2, 0));
                subscriptions.push(s1.Observe().subscribe(value => trace.push({ Signal: s1, Value: value })));
                subscriptions.push(s2.Observe().subscribe(value => trace.push({ Signal: s2, Value: value })));
                subscriptions.push(s3.Observe().subscribe(value => trace.push({ Signal: s3, Value: value })));
                const assert = assertBuilder('trace', 's1', 's2', 's3')(trace, s1, s2, s3);
                assert('trace[0].Signal === s1');
                assert('trace[0].Value  === 1' );
                assert('trace[1].Signal === s2');
                assert('trace[1].Value  === 2' );
                assert('trace[2].Signal === s3');
                assert('trace[2].Value  === 3' );

                describe(
                    'Given scheduler.Update(s => { s1.Update(2, s); s2.Update(3, s); }):',
                    () =>
                    {
                        scheduler.Update(s =>
                        {
                            s1.Update(2, s);
                            s2.Update(3, s);
                        });
                        assert('trace[3].Signal === s1');
                        assert('trace[3].Value  === 2' );
                        assert('trace[4].Signal === s2');
                        assert('trace[4].Value  === 3' );
                        assert('trace[5].Signal === s3');
                        assert('trace[5].Value  === 5' );
                        assert('trace.length    === 6' );
                    });
            });
        subscriptions.forEach(subscription => subscription.unsubscribe());

        trace = [];
        subscriptions = [];

        describe(
            `Given
scheduler = new Scheduler(),
s1 = new Signal(1),
s2 = new Signal(2),
s3 = new Signal(3),
s4 = Map(s1, s2, (n1, n2) => n1 + n2) and
s5 = Map(s3, s4, (n1, n2) => n1 + n2):`,
            () =>
            {
                const scheduler = new Scheduler();
                const s1 = new Signal(1);
                const s2 = new Signal(2);
                const s3 = new Signal(3);
                const s4 = Map(s1, s2, (n1, n2) => n1 + n2);
                const s5 = Map(s3, s4, (n1, n2) => n1 + n2);
                subscriptions.push(s1.Observe().subscribe(value => trace.push({ Signal: s1, Value: value })));
                subscriptions.push(s2.Observe().subscribe(value => trace.push({ Signal: s2, Value: value })));
                subscriptions.push(s3.Observe().subscribe(value => trace.push({ Signal: s3, Value: value })));
                subscriptions.push(s4.Observe().subscribe(value => trace.push({ Signal: s4, Value: value })));
                subscriptions.push(s5.Observe().subscribe(value => trace.push({ Signal: s5, Value: value })));
                const assert = assertBuilder('trace', 's1', 's2', 's3', 's4', 's5')(trace, s1, s2, s3, s4, s5);
                assert('trace[0].Signal === s1');
                assert('trace[0].Value  === 1' );
                assert('trace[1].Signal === s2');
                assert('trace[1].Value  === 2' );
                assert('trace[2].Signal === s3');
                assert('trace[2].Value  === 3' );
                assert('trace[3].Signal === s4');
                assert('trace[3].Value  === 3' );
                assert('trace[4].Signal === s5');
                assert('trace[4].Value  === 6' );

                describe(
                    'Given scheduler.Update(s => { s3.Update(4, s); s1.Update(2, s); }):',
                    () =>
                    {
                        scheduler.Update(s =>
                        {
                            s3.Update(4, s);
                            s1.Update(2, s);
                        });
                        assert('trace[5].Signal === s3');
                        assert('trace[5].Value  === 4' );
                        assert('trace[6].Signal === s1');
                        assert('trace[6].Value  === 2' );
                        assert('trace[7].Signal === s4');
                        assert('trace[7].Value  === 4' );
                        assert('trace[8].Signal === s5');
                        assert('trace[8].Value  === 8' );
                        assert('trace.length    === 9' );
                    });
            });
        subscriptions.forEach(subscription => subscription.unsubscribe());

    });
