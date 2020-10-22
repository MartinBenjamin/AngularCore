import { Inject, Injectable } from '@angular/core';
import { formatUTCDate, parseUTCDate } from './Date';
import { DatePatternsToken } from './DatePatterns';
import { IConversionService } from './IConversionService';
import { Patterns } from './Patterns';

@Injectable()
export class DateConversionService implements IConversionService<Date>
{
    private _parsers  : ((value: string) => Date)[];
    private _formatter: (date: Date) => string;

    constructor(
        @Inject(DatePatternsToken)
        patterns: Patterns
        )
    {
        this._parsers   = patterns.Input.map(inputPattern => parseUTCDate(inputPattern));
        this._formatter = formatUTCDate(patterns.Output);
    }

    Parse(
        value: string
        ): Date
    {
        var date: Date = null;
        var index: number = 0;
        while(index < this._parsers.length && !(date = this._parsers[index++](value)));
        return date;
    }

    Format(
        date: Date
        ): string
    {
        return this._formatter(date);
    }
}
