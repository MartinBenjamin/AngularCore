import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabbedViewModule } from '../../Components/TabbedView';
import { DealModule } from '../Deal.Module';
import { Advisory } from './Advisory';


const routes: Routes =
    [
        {
            path: '',
            component: Advisory,
            outlet: 'feature'
        }
    ];

@NgModule(
    {
        declarations:
            [
                Advisory
            ],
        imports:
            [
                CommonModule,
                RouterModule.forChild(routes),
                DealModule,
                TabbedViewModule
            ]
    })
export class AdvisoryModule
{ }
