import { NgModule } from '@angular/core';
import { Menu } from './Menu';
import { MyDeals } from './MyDeals';
import { DealModule } from './DealModule';

@NgModule(
    {
        declarations:
            [
                Menu,
                MyDeals
            ],
        exports:
            [
                Menu,
                DealModule
            ]
    })
export class OriginationModule
{ }
