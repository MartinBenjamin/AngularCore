import { } from 'jasmine';

export function assertBuilder(
    ...argNames
    ): (...args) => (assertion: string) => void
{
    return function(
        ...args
        )
    {
        return (assertion: string): void => it(
            assertion,
            () => expect(new Function(
                ...argNames,
                'return ' + assertion)(...args)).toBe(true));
    }
}
