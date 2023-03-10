import { } from 'jasmine';
import { assertBuilder } from './assertBuilder';
import { Compare, EntityId, TypeCollation } from './EavStore';

const symbol = Symbol('Symbol');

describe(
    'Compare',
    () =>
    {
        it('Compare(undefined, undefined) === 0',
            () => expect(Compare(undefined, undefined)).toBe(0));

        it('Compare(undefined, {}) <== 0',
            () => expect(Compare(undefined, {})).toBeLessThan(0));

        it('Compare(undefined, null) <== 0',
            () => expect(Compare(undefined, null)).toBeLessThan(0));

        it("Compare('abc', 'abc') === 0",
            () => expect(Compare('abc', 'abc')).toBe(0));

        const assert = assertBuilder('TypeCollation', 'Compare', 'EntityId', 'symbol')(TypeCollation, Compare, EntityId, symbol);
        assert('Compare(undefined, undefined) === 0');
        assert('Compare(null, null) === 0');
        assert('Compare(null, { [Symbol.toPrimitive]:() => 0 }) === 0');
        assert('Compare({ [Symbol.toPrimitive]:() => 0 }, null) === 0');
        assert('Compare({ [Symbol.toPrimitive]:() =>  1 }, null) > 0');
        assert('Compare({ [Symbol.toPrimitive]:() => -1 }, null) < 0');
        const mixed = ["undefined", "null", "{ [Symbol.toPrimitive]:() => 1 }", "{ [Symbol.toPrimitive]:() => 2 }", "true", "false", "0", "1", "2", "''", "'a'", "'ab'", "symbol"];
        for(const a of mixed)
            for(const b of mixed)
            {
                assert(`Compare(${a}, ${b}) !== 0 || Compare(${b}, ${a}) === 0`);
                assert(`Compare(${a}, ${b}) === -Compare(${b}, ${a})`);
                assert(`typeof ${a} === typeof ${b} || Compare(${a}, ${b}) === TypeCollation[typeof ${a}] - TypeCollation[typeof ${b}]`);
                assert(`typeof ${a} !== typeof ${b} || Compare(${a}, ${b}) ${a < b ? '<' : a > b ? '>' : '==='} 0`);
            }

        const numbers = [1, 2, 3];
        for(const a of numbers)
            for(const b of numbers)
            {
                assert(`Compare({ [Symbol.toPrimitive]:() => ${a}}, { [Symbol.toPrimitive]:() => ${b}}) ${a === b ? '===' : a < b ? '<' : '>'} 0`);
                assert(`Compare({ [EntityId]: ${a}, [Symbol.toPrimitive]:() => 0 }, { [EntityId]: ${b}, [Symbol.toPrimitive]:() => 0 }) ${a === b ? '===' : a < b ? '<' : '>'} 0`);
            }
    });
