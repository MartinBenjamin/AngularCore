import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AmountInputDefinition, AmountInputDefinitionToken } from './AmountInputDefinition';
import { PercentageInputDefinition, PercentageInputDefinitionToken } from './PercentageInputDefinition';
import { Percentage100InputDefinition, Percentage100InputDefinitionToken } from './Percentage100InputDefinition';
import { AmountConversionService } from './AmountConversionService';
import { PercentageConversionService } from './PercentageConversionService';
import { Percentage100ConversionService } from './Percentage100ConversionService';
import { AmountModel } from './AmountModel';
import { PercentageModel } from './PercentageModel';
import { Percentage100Model } from './Percentage100Model';
import { AmountPipe } from './AmountPipe';
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
            {
                provide: PercentageInputDefinitionToken,
                useValue: PercentageInputDefinition
            },
            {
                provide: Percentage100InputDefinitionToken,
                useValue: Percentage100InputDefinition
            },
            AmountConversionService,
            PercentageConversionService,
            Percentage100ConversionService
        ]
    })
export class NumberModule
{ }