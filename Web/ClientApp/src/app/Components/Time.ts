export interface DateDescription
{
    Year : number;
    Month: number;
    Day  : number;
}

export function IsDateDescription(
    o: any
    ): o is DateDescription
{
    return typeof o.Year === 'number' && typeof o.Month === 'number' && typeof o.Day === 'number';
}
