import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DealTrackerLayout } from '../DealTrackerLayout';
import { Menu } from './Menu';
import { Origination } from './Origination';

const routes: Routes =
    [
        {
            path: '',
            component: Origination,
            children:
                [
                    {
                        path: 'MyDeals',
                        loadChildren: () => import('./MyDeals/MyDeals.Module').then(
                            module => module.MyDealsModule)
                    },
                    {
                        path: 'ProjectFinance',
                        loadChildren: () => import('./ProjectFinance/ProjectFinance.Module').then(
                            module => module.ProjectFinanceModule)
                    }
                ]
        }
    ];

@NgModule(
    {
        declarations:
            [
                DealTrackerLayout,
                Menu,
                Origination
            ],
        imports:
            [
                RouterModule.forChild(routes)
            ]
    })
export class OriginationModule
{ }
