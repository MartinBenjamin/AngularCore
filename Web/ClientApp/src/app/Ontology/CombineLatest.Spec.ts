import { } from 'jasmine';
import { BehaviorSubject, Observable } from "rxjs";

describe(
    'combineLatest',
    () =>
    {
        let c1: Observable<number[]> = new BehaviorSubject<number[]>([1, 2]);
        let c2: Observable<number[]> = new BehaviorSubject<number[]>([2, 3]);
        let c3: Observable<number[]> = new BehaviorSubject<number[]>([2, 4]);

        let c4 = c1.combineLatest(c2, c3);
        //let c4 = c1.combineLatest.apply(c1, [c2, c3]);

        it(
            'typeof c3.subscribe === "function"',
            () => expect(typeof c4.subscribe === "function").toBe(true));

        let result;
        c4.subscribe(combined => result = combined);

        it(
            'result instanceof Array',
            () => expect(result instanceof Array).toBe(true));

        if(result instanceof Array)
        {
            it(
                'result.length === 3',
                () => expect(result.length === 3).toBe(true));

        }

        let c5 = c1.combineLatest([c2, c3]);

        it(
            'typeof c5.subscribe === "function"',
            () => expect(typeof c5.subscribe === "function").toBe(true));

        let result1;
        c5.subscribe(combined => result1 = combined);

        it(
            'result1 instanceof Array',
            () => expect(result1 instanceof Array).toBe(true));

        if(result1 instanceof Array)
        {
            it(
                'result1.length === 3',
                () => expect(result1.length === 3).toBe(true));
        }
    });
