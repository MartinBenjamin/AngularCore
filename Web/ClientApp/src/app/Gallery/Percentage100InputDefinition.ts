import { InjectionToken } from '@angular/core';
import { NumberInputDefinition } from './NumberInputDefinition';

export let Percentage100InputDefinitionToken = new InjectionToken<NumberInputDefinition>("Percentage100InputDefinition");
export let Percentage100InputDefinition: NumberInputDefinition =
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