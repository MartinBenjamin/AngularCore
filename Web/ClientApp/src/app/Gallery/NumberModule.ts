import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AmountConversionService } from './AmountConversionService';
import { AmountInputDefinition, AmountInputDefinitionToken } from './AmountInputDefinition';
import { AmountModel } from './AmountModel';
import { AmountPipe } from './AmountPipe';
import { Percentage100ConversionServiceProvider } from './Percentage100InputDefinition';
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
                Percentage100ConversionServiceProvider,
                AmountConversionService,
            ]
    })
export class NumberModule
{ }
