import { InjectionToken, Provider } from '@angular/core';
import { NumberInputDefinition } from './NumberInputDefinition';
import { IConversionService } from './IConversionService';
import { NumberConversionService } from './NumberConversionService';

export const PercentageConversionServiceToken = new InjectionToken<IConversionService<number>>('PercentageConversionService');
const percentageInputDefinition: NumberInputDefinition =
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
        Max: 999.99
    }
};

const conversionService = new NumberConversionService(percentageInputDefinition);

export const PercentageConversionServiceProvider: Provider =
{
    provide: PercentageConversionServiceToken,
    useValue: conversionService
};
