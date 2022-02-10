import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccrualDateEditor } from './AccrualDateEditor';
import { AccrualDatePipe } from './AccrualDatePipe';
import { Calendar } from './Calendar';
import { DateConversionService } from './DateConversionService';
import { DateModel } from './DateModel';
import { DatePatterns, DatePatternsToken } from './DatePatterns';
import { NumberModule } from './NumberModule';
import { UtcDatePipe } from './UtcDatePipe';

@NgModule(
    {
        imports:
        [
            CommonModule,
            FormsModule,
            NumberModule
        ],
        declarations:
        [
            AccrualDateEditor,
            AccrualDatePipe,
            DateModel,
            Calendar,
            UtcDatePipe
        ],
        exports:
        [
            AccrualDateEditor,
            AccrualDatePipe,
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
