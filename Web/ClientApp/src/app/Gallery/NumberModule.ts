import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AmountConversionService } from './AmountConversionService';
import { AmountInputDefinition, AmountInputDefinitionToken } from './AmountInputDefinition';
import { AmountModel } from './AmountModel';
import { AmountPipe } from './AmountPipe';
import { Percentage100ConversionService } from './Percentage100ConversionService';
import { Percentage100InputDefinition, Percentage100InputDefinitionToken } from './Percentage100InputDefinition';
import { Percentage100Model } from './Percentage100Model';
import { PercentageConversionServiceProvider } from './PercentageInputDefinition';
import { PercentageModel } from './PercentageModel';
import { PercentagePipe } from './PercentagePipe';

@NgModule(
    {
        imports:
        [
            CommonModule
        ],
        declarations:
        [
            AmountModel,
            AmountPipe,
            PercentageModel,
            PercentagePipe,
            Percentage100Model
        ],
        exports:
        [
            AmountModel,
            AmountPipe,
            PercentageModel,
            PercentagePipe,
            Percentage100Model
        ],
        providers:
        [
            {
                provide: AmountInputDefinitionToken,
                useValue: AmountInputDefinition
            },
            PercentageConversionServiceProvider,
            {
                provide: Percentage100InputDefinitionToken,
                useValue: Percentage100InputDefinition
            },
            AmountConversionService,
            Percentage100ConversionService
        ]
    })
export class NumberModule
{ }
