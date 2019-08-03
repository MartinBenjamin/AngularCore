import { Inject, Injectable } from '@angular/core';
import { NumberConversionService } from './NumberConversionService';
import { NumberInputDefinition } from './NumberInputDefinition';
import { PercentageInputDefinitionToken } from './PercentageInputDefinition';

@Injectable()
export class PercentageConversionService extends NumberConversionService
{
    constructor(
        @Inject(PercentageInputDefinitionToken)
        numberInputDefinition: NumberInputDefinition
        )
    {
        super(numberInputDefinition);
    }
}