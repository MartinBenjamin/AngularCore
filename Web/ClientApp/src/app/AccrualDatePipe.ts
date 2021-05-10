import { Inject, InjectionToken, Optional, Pipe, PipeTransform } from '@angular/core';
import { AccrualDate } from './AccrualDate';
import { formatUTCDate } from './Components/Date';
import { Patterns } from './Components/Patterns';

export let AccrualDatePatternsToken = new InjectionToken<Patterns>("AccrualDatePatterns");

@Pipe(
    {
        name: 'accrualDate'
    })
export class AccrualDatePipe implements PipeTransform
{
    private static _defaultFormat = 'MMM-yyyy';
    private _formatUTCDate: (date: Date) => string;

    constructor(
        @Optional()
        @Inject(AccrualDatePatternsToken)
        patterns: Patterns
        )
    {
        this._formatUTCDate = formatUTCDate(patterns ? patterns.Output : AccrualDatePipe._defaultFormat);
    }

    transform(
        accrualDate: AccrualDate
        ): string
    {
        return accrualDate ? this._formatUTCDate(new Date(Date.UTC(accrualDate.Year, accrualDate.Month - 1, 1))) : '';
    }
}
