import { DateDescription } from './Time';

export type AccrualDateMonth = 3 | 6 | 9 | 12;

export interface AccrualDate extends DateDescription
{
    Month: AccrualDateMonth;
    Day  : 1;
}

export let AccrualDateMonths = [3, 6, 9, 12];
