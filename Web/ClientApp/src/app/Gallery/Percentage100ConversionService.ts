import { Inject, Injectable } from '@angular/core';
import { NumberConversionService } from './NumberConversionService';
import { NumberInputDefinition } from './NumberInputDefinition';
import { Percentage100InputDefinitionToken } from './Percentage100InputDefinition';

@Injectable()
export class Percentage100ConversionService extends NumberConversionService
{
    constructor(
        @Inject(Percentage100InputDefinitionToken)
        numberInputDefinition: NumberInputDefinition
    )
    {
        super(numberInputDefinition);
    }
}