import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from './Components/Dialog';
import { GeographicRegionSelector } from './GeographicRegionSelector';

@NgModule(
    {
        declarations:
            [
                GeographicRegionSelector
            ],
        imports:
            [
                CommonModule,
                DialogModule,
                FormsModule
            ],
        exports:
            [
                GeographicRegionSelector
            ]
    })
export class GeographicRegionSelectorModule
{ }
