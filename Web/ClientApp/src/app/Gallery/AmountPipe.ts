import { Pipe } from '@angular/core';
import { AmountConversionService } from './AmountConversionService';
import { NumberPipe } from './NumberPipe';

@Pipe(
    {
        name: 'amount'
    })
export class AmountPipe extends NumberPipe
{
    constructor(
        amountConversionService: AmountConversionService
        )
    {
        super(amountConversionService);
    }
}
