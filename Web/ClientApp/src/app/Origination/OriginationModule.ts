import { NgModule } from '@angular/core';
import { Menu } from './Menu';
import { DealModule } from './DealModule';

@NgModule(
    {
        declarations:
            [
                Menu
            ],
        exports:
            [
                Menu,
                DealModule
            ]
    })
export class OriginationModule
{ }
