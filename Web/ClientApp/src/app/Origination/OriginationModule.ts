import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DealModule } from './DealModule';
import { Menu } from './Menu';
import { MyDeals } from './MyDeals';


@NgModule(
    {
        declarations:
            [
                Menu,
                MyDeals
            ],
        imports:
            [
                RouterModule
            ],
        exports:
            [
                Menu,
                DealModule
            ]
    })
export class OriginationModule
{ }
