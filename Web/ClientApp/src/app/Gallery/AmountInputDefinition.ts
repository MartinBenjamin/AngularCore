import { InjectionToken } from '@angular/core';
import { NumberInputDefinition } from './NumberInputDefinition';

export let AmountInputDefinitionToken = new InjectionToken<NumberInputDefinition>("AmountInputDefinition");
export let AmountInputDefinition: NumberInputDefinition =
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