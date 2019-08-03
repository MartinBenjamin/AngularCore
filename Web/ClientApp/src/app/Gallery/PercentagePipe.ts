import { Pipe } from '@angular/core';
import { NumberPipe } from './NumberPipe';
import { PercentageConversionService } from './PercentageConversionService';

@Pipe(
    {
        name: 'percentage'
    })
export class PercentagePipe extends NumberPipe
{
    constructor(
        percentageConversionService: PercentageConversionService
        )
    {
        super(percentageConversionService);
    }
}
