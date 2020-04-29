import { Inject, Pipe } from '@angular/core';
import { AmountConversionServiceToken } from './AmountInputDefinition';
import { IConversionService } from './IConversionService';
import { NumberPipe } from './NumberPipe';

@Pipe(
    {
        name: 'amount'
    })
export class AmountPipe extends NumberPipe
{
    constructor(
        @Inject(AmountConversionServiceToken)
        amountConversionService: IConversionService<number>
        )
    {
        super(amountConversionService);
    }
}
