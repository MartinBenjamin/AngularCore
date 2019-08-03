import { Inject, Injectable } from '@angular/core';
import { AmountInputDefinitionToken } from './AmountInputDefinition';
import { NumberConversionService } from './NumberConversionService';
import { NumberInputDefinition } from './NumberInputDefinition';

@Injectable()
export class AmountConversionService extends NumberConversionService
{
    constructor(
        @Inject(AmountInputDefinitionToken)
        numberInputDefinition: NumberInputDefinition
        )
    {
        super(numberInputDefinition);
    }
}
