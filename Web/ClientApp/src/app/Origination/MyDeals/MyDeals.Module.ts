import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyDeals } from './MyDeals';

const routes: Routes =
    [
        {
            path: '',
            component: MyDeals,
            outlet: 'feature'
        }
    ];

@NgModule(
    {
        declarations:
            [
                MyDeals
            ],
        imports:
            [
                CommonModule,
                RouterModule.forChild(routes)
            ]
    })
export class MyDealsModule
{ }
