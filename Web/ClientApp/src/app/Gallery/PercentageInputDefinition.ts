import { InjectionToken } from '@angular/core';
import { NumberInputDefinition } from './NumberInputDefinition';

export let PercentageInputDefinitionToken = new InjectionToken<NumberInputDefinition>("PercentageInputDefinition");
export let PercentageInputDefinition: NumberInputDefinition =
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