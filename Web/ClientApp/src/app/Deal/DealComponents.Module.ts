import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DateModule } from '../Components/DateModule';
import { DialogModule } from '../Components/Dialog';
import { ErrorModule } from '../Components/ErrorModule';
import { NumberModule } from '../Components/NumberModule';
import { TabbedViewModule } from '../Components/TabbedView';
import { YesNoPipeModule } from '../Components/YesNoPipe';
import { LegalEntityFinder, LegalEntityFinderButtons } from '../LegalEntityFinder';
import { Borrowers } from './Borrowers';
import { ExternalFunding } from './ExternalFunding';
import { Facility } from './Facility';
import { FacilityErrors } from './FacilityErrors';
import { FacilityFeeEditor } from './FacilityFeeEditor';
import { FacilityFeeErrors } from './FacilityFeeErrors';
import { FacilityFees } from './FacilityFees';
import { FacilityTab } from './FacilityTab';
import { FacilityTab1 } from './FacilityTab1';
import { FacilityTab3 } from './FacilityTab3';
import { GeographicRegionSelector } from './GeographicRegionSelector';
import { Sponsors } from './Sponsors';

@NgModule(
    {
        declarations:
            [
                Borrowers,
                ExternalFunding,
                Facility,
                FacilityErrors,
                FacilityFeeEditor,
                FacilityFeeErrors,
                FacilityFees,
                FacilityTab,
                FacilityTab1,
                FacilityTab3,
                GeographicRegionSelector,
                LegalEntityFinder,
                LegalEntityFinderButtons,
                Sponsors
            ],
        imports:
            [
                CommonModule,
                DateModule,
                DialogModule,
                ErrorModule,
                FormsModule,
                NumberModule,
                TabbedViewModule,
                YesNoPipeModule
            ],
        exports:
            [
                Borrowers,
                Facility,
                GeographicRegionSelector,
                LegalEntityFinder,
                LegalEntityFinderButtons,
                Sponsors
            ]
    })
export class DealComponentsModule
{ }
