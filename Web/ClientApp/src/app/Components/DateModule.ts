import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Calendar } from './Calendar';
import { DateConversionService } from './DateConversionService';
import { DateModel } from './DateModel';
import { DateModel2 } from './DateModel2';
import { DatePatterns, DatePatternsToken } from './DatePatterns';
import { UtcDatePipe } from './UtcDatePipe';

@NgModule(
    {
        imports:
        [
            CommonModule
        ],
        declarations:
        [
            DateModel,
            DateModel2,
            Calendar,
            UtcDatePipe
        ],
        exports:
        [
            DateModel,
            DateModel2,
            Calendar,
            UtcDatePipe
        ],
        providers:
        [
            DateConversionService,
            {
                provide: DatePatternsToken,
                useValue: DatePatterns
            }
        ]
    })
export class DateModule
{ }
