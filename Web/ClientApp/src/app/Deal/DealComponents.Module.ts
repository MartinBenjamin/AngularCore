import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DateModule } from '../Components/DateModule';
import { DialogModule } from '../Components/Dialog';
import { ErrorModule } from '../Components/ErrorModule';
import { NumberModule } from '../Components/NumberModule';
import { TabbedViewModule } from '../Components/TabbedView';
import { YesNoPipeModule } from '../Components/YesNoPipe';
import { GeographicRegionSelectorModule } from '../GeographicRegionSelector.Module';
import { LegalEntityFinderModule } from '../LegalEntityFinder.Module';

@NgModule(
    {
        declarations:
            [
            ],
        imports:
            [
                CommonModule,
                DateModule,
                DialogModule,
                ErrorModule,
                FormsModule,
                GeographicRegionSelectorModule,
                LegalEntityFinderModule,
                NumberModule,
                TabbedViewModule,
                YesNoPipeModule
            ],
        exports:
            [
            ]
    })
export class DealComponentsModule
{ }
