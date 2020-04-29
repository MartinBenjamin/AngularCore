import { InjectionToken, Provider } from '@angular/core';
import { NumberInputDefinition } from './NumberInputDefinition';
import { NumberConversionService } from './NumberConversionService';
import { IConversionService } from './IConversionService';

export const Percentage100ConversionServiceToken = new InjectionToken<IConversionService<number>>('Percentage100ConversionService');
const percentage100InputDefinition: NumberInputDefinition =
{
    Patterns:
    {
        Input:
            [
                '0.##'
            ],
        Output: '0.00'
    },
    Range:
    {
        Min: 0,
        Max: 100.00
    }
};

export const Percentage100ConversionServiceProvider: Provider =
{
    provide: Percentage100ConversionServiceToken,
    useValue: new NumberConversionService(percentage100InputDefinition)
};
