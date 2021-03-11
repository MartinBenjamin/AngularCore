import { Pipe, PipeTransform } from '@angular/core';

@Pipe(
    {
        name: 'yesNo'
    })
export class YesNoPipe implements PipeTransform
{
    transform(
        yesNo: boolean
        ): string
    {
        return typeof yesNo === 'boolean' ? yesNo ? 'Yes' : 'No' : '';
    }
}
