import { } from 'jasmine';
import { ArrayProxyFactory } from './IEavStore';
import { assertBuilder } from './assertBuilder';



describe(
    'Given array = [] and arrayProxy = ArrayProxyFactory(null, null, array)',
    () =>
    {
        const array = [];
        const arrayProxy = ArrayProxyFactory(null, null, array)
        const x = {};
        let assert = assertBuilder('array', 'arrayProxy', 'x')
            (array, arrayProxy, x);
        assert('arrayProxy.push(x) === 1');
        assert('array.includes(x)');
        assert('arrayProxy.includes(x)');
        assert('arrayProxy.length === 1');
        assert('arrayProxy[0] === x')
        assert('arrayProxy.pop() === x');
        assert('array.length === 0');
        assert('arrayProxy.length === 0');

        assert('arrayProxy.unshift(x) === 1');
        assert('array.includes(x)');
        assert('arrayProxy.includes(x)');
        assert('arrayProxy.length === 1');
        assert('arrayProxy[0] === x')
        assert('arrayProxy.shift() === x');
        assert('array.length === 0');
        assert('arrayProxy.length === 0');

        assert('arrayProxy.push(x) === 1');
        assert('arrayProxy.splice(0, 1).includes(x)');
        assert('array.length === 0');
        assert('arrayProxy.length === 0');
    });
