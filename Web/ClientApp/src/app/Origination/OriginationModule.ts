import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
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
                Menu
            ]
    })
export class OriginationModule
{ }
