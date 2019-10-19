import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ProjectFinanceModule } from './ProjectFinance/ProjectFinance.Module';

@NgModule(
    {
        imports:
            [
                CommonModule,
                ProjectFinanceModule
            ],
        exports:
            [
            ],
        entryComponents:
            [
            ]
    })
export class DealModule
{ }
