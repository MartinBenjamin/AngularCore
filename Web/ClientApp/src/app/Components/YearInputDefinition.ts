import { InjectionToken, Provider } from '@angular/core';
import { IConversionService } from './IConversionService';
import { NumberConversionService } from './NumberConversionService';
import { NumberInputDefinition } from './NumberInputDefinition';

export const YearConversionServiceToken = new InjectionToken<IConversionService<number>>('YearConversionService');
const yearInputDefinition: NumberInputDefinition =
{
    Patterns:
    {
        Input:
            [
                '0000'
            ],
        Output: '0000'
    },
    Range:
    {
        Min: 0,
        Max: 9999
    }
};

export const YearConversionServiceProvider: Provider =
{
    provide: YearConversionServiceToken,
    useValue: new NumberConversionService(yearInputDefinition)
};
