import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Calendar } from './Calendar';
import { DateConversionService } from './DateConversionService';
import { DateModel } from './DateModel';
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
            Calendar,
            UtcDatePipe
        ],
        exports:
        [
            DateModel,
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
