import { Inject, Pipe } from '@angular/core';
import { IConversionService } from './IConversionService';
import { NumberPipe } from './NumberPipe';
import { PercentageConversionServiceToken } from './PercentageInputDefinition';

@Pipe(
    {
        name: 'percentage'
    })
export class PercentagePipe extends NumberPipe
{
    constructor(
        @Inject(PercentageConversionServiceToken)
        percentageConversionService: IConversionService<number>
        )
    {
        super(percentageConversionService);
    }
}
