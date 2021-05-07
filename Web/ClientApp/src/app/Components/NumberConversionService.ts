import { IConversionService } from './IConversionService';
import { formatNumber, parseNumber } from './Number';
import { NumberInputDefinition } from './NumberInputDefinition';

export class NumberConversionService implements IConversionService<number>
{
    private _parsers: ((value: string) => number)[];
    private _formatter: (number: number) => string;

    constructor(
        private _numberInputDefinition: NumberInputDefinition
        )
    {
        this._parsers = _numberInputDefinition.Patterns.Input.map(inputPattern => parseNumber(inputPattern));
        this._formatter = formatNumber(_numberInputDefinition.Patterns.Output);
    }

    Parse(
        value: string
        ): number
    {
        let number: number = null;
        let index = 0;
        while(index < this._parsers.length && isNaN(number = this._parsers[index++](value)));

        if(isNaN(number))
            return number;

        if(number < this._numberInputDefinition.Range.Min ||
           number > this._numberInputDefinition.Range.Max)
            return NaN;

        return number;
    }

    Format(
        number: number
        ): string
    {
        return this._formatter(number);
    }
}
