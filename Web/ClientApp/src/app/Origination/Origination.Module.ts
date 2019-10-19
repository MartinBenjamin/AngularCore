import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Menu } from './Menu';

@NgModule(
    {
        declarations:
            [
                Menu
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
