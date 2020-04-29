import { InjectionToken, Provider } from '@angular/core';
import { IConversionService } from './IConversionService';
import { NumberConversionService } from './NumberConversionService';
import { NumberInputDefinition } from './NumberInputDefinition';

export const AmountConversionServiceToken = new InjectionToken<IConversionService<number>>('AmountConversionService');
const amountInputDefinition: NumberInputDefinition =
{
    Patterns:
    {
        Input:
            [
                '#,##0.##',
                '0.##'
            ],
        Output: '#,##0.00'
    },
    Range:
    {
        Min: -Infinity,
        Max: Infinity
    }
};

export const AmountConversionServiceProvider: Provider =
{
    provide: AmountConversionServiceToken,
    useValue: new NumberConversionService(amountInputDefinition)
};
