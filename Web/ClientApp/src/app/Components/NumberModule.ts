import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AmountConversionServiceProvider } from './AmountInputDefinition';
import { AmountModel } from './AmountModel';
import { AmountPipe } from './AmountPipe';
import { Percentage100ConversionServiceProvider } from './Percentage100InputDefinition';
import { Percentage100Model } from './Percentage100Model';
import { PercentageConversionServiceProvider } from './PercentageInputDefinition';
import { PercentageModel } from './PercentageModel';
import { PercentagePipe } from './PercentagePipe';
import { YearConversionServiceProvider } from './YearInputDefinition';
import { YearModel } from './YearModel';

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
                Percentage100Model,
                YearModel
            ],
        exports:
            [
                AmountModel,
                AmountPipe,
                PercentageModel,
                PercentagePipe,
                Percentage100Model,
                YearModel
            ],
        providers:
            [
                AmountConversionServiceProvider,
                PercentageConversionServiceProvider,
                Percentage100ConversionServiceProvider,
                YearConversionServiceProvider
            ]
    })
export class NumberModule
{ }
