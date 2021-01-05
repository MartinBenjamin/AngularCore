import { Inject, Pipe, PipeTransform } from '@angular/core';
import { formatUTCDate } from './Date';
import { DatePatternsToken } from './DatePatterns';
import { Patterns } from './Patterns';

@Pipe(
{
    name: 'utcDate'
})
export class UtcDatePipe implements PipeTransform
{
    private _formatUTCDate: (date: Date) => string;

    constructor(
        @Inject(DatePatternsToken)
        patterns: Patterns
        )
    {
        this._formatUTCDate = formatUTCDate(patterns.Output);
    }

    transform(
        date: Date
        ): string
    {
        return date instanceof Date ? this._formatUTCDate(date) : '';
    }
}
