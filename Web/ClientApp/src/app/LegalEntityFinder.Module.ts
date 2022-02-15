import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from './Components/Dialog';
import { LegalEntityFinder, LegalEntityFinderButtons } from './LegalEntityFinder';

@NgModule(
    {
        declarations:
            [
                LegalEntityFinder,
                LegalEntityFinderButtons
            ],
        imports:
            [
                CommonModule,
                DialogModule,
                FormsModule
            ],
        exports:
            [
                LegalEntityFinder,
                LegalEntityFinderButtons
            ]
    })
export class LegalEntityFinderModule
{ }
