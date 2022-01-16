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
                        path: 'Deal',
                        loadChildren: () => import('./Deal/Deal.Module').then(
                            module => module.DealModule)
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
