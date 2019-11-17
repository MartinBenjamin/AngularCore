import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DealTrackerLayoutModule } from '../DealTrackerLayout.Module';
import { AssetManagement } from './AssetManagement';

const routes: Routes =
    [
        {
            path: '',
            component: AssetManagement,
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
                    }
                ]
        }
    ];

@NgModule(
    {
        declarations:
            [
                AssetManagement
            ],
        imports:
            [
                CommonModule,
                DealTrackerLayoutModule,
                RouterModule.forChild(routes)
            ]
    })
export class AssetManagementModule
{ }
