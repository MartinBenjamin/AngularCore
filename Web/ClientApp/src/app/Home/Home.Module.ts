import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DealTrackerLayoutModule } from '../DealTrackerLayout.Module';
import { Aircraft } from './Aircraft';
import { Home } from './Home';

const routes: Routes =
    [
        {
            path: '',
            component: Home
        }
    ];

@NgModule(
    {
        declarations:
            [
                Aircraft,
                Home
            ],
        imports:
            [
                CommonModule,
                DealTrackerLayoutModule,
                RouterModule.forChild(routes)
            ]
    })
export class HomeModule
{ }
