import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TabbedViewModule } from '../../Gallery/TabbedView';
import { KeyDealData } from '../KeyDealData';
import { MoreTabs } from '../MoreTabs';
import { OriginationTab } from '../OriginationTab';
import { ProjectFinance } from './ProjectFinance';

const routes: Routes =
    [
        {
            path: '',
            component: ProjectFinance
        }
    ];

@NgModule(
    {
        declarations:
            [
                KeyDealData,
                MoreTabs,
                OriginationTab,
                ProjectFinance
            ],
        imports:
            [
                CommonModule,
                RouterModule.forChild(routes),
                TabbedViewModule
            ],
        entryComponents:
            [
                KeyDealData,
                OriginationTab,
                MoreTabs
            ]
    })
export class ProjectFinanceModule
{ }
