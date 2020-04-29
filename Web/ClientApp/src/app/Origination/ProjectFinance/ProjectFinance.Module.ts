import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabbedViewModule } from '../../Components/TabbedView';
import { DealModule } from '../Deal.Module';
import { ProjectFinance } from './ProjectFinance';

const routes: Routes =
    [
        {
            path: '',
            component: ProjectFinance,
            outlet: 'feature'
        }
    ];

@NgModule(
    {
        declarations:
            [
                ProjectFinance
            ],
        imports:
            [
                CommonModule,
                RouterModule.forChild(routes),
                DealModule,
                TabbedViewModule
            ]
    })
export class ProjectFinanceModule
{ }
