export type AccrualDateMonth = 3 | 6 | 9 | 12;

export interface AccrualDate
{
    Year: number;
    Month: AccrualDateMonth;
}

export let AccrualDateMonths = [3, 6, 9, 12];
