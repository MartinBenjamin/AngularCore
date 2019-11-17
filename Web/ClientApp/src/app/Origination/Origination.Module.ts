import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DealTrackerLayoutModule } from '../DealTrackerLayout.Module';
import { Origination } from './Origination';

const routes: Routes =
    [
        {
            path: '',
            component: Origination,
            children:
                [
                    {
                        path: '',
                        redirectTo: 'MyDeals',
                        pathMatch: 'full'
                    },
                    {
                        path: 'MyDeals',
                        loadChildren: () => import('./MyDeals/MyDeals.Module').then(
                            module => module.MyDealsModule)
                    },
                    {
                        path: 'ProjectFinance',
                        loadChildren: () => import('./ProjectFinance/ProjectFinance.Module').then(
                            module => module.ProjectFinanceModule)
                    },
                    {
                        path: 'Advisory',
                        loadChildren: () => import('./Advisory/Advisory.Module').then(
                            module => module.AdvisoryModule)
                    }
                ]
        }
    ];

@NgModule(
    {
        declarations:
            [
                Origination
            ],
        imports:
            [
                CommonModule,
                DealTrackerLayoutModule,
                RouterModule.forChild(routes)
            ]
    })
export class OriginationModule
{ }
