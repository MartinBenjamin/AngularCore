import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DateModule } from '../Components/DateModule';
import { DialogModule } from '../Components/Dialog';
import { ErrorModule } from '../Components/ErrorModule';
import { NumberModule } from '../Components/NumberModule';
import { TabbedViewModule } from '../Components/TabbedView';
import { Borrowers } from '../Deal/Borrowers';
import { Facility } from '../Deal/Facility';
import { FacilityTab } from '../Deal/FacilityTab';
import { FacilityTab1 } from '../Deal/FacilityTab1';
import { GeographicRegionSelector } from '../Deal/GeographicRegionSelector';
import { Sponsors } from '../Deal/Sponsors';
import { LegalEntityFinder, LegalEntityFinderButtons } from '../LegalEntityFinder';
import { Common } from './Common';
import { DealGeographicRegion } from './DealGeographicRegion';
import { Exclusivity } from './Exclusivity';
import { FacilitiesComponent } from './FacilitiesComponent';
import { KeyCounterparties } from './KeyCounterparties';
import { KeyDealData } from './KeyDealData';
import { MoreTabs } from './MoreTabs';
import { OriginationTab } from './OriginationTab';
import { TransactionDetails } from './TransactionDetails';

@NgModule(
    {
        declarations:
            [
                Borrowers,
                Common,
                DealGeographicRegion,
                Exclusivity,
                FacilitiesComponent,
                Facility,
                FacilityTab,
                FacilityTab1,
                GeographicRegionSelector,
                KeyCounterparties,
                KeyDealData,
                LegalEntityFinder,
                LegalEntityFinderButtons,
                MoreTabs,
                OriginationTab,
                Sponsors,
                TransactionDetails
            ],
        imports:
            [
                CommonModule,
                DateModule,
                DialogModule,
                ErrorModule,
                FormsModule,
                NumberModule,
                TabbedViewModule
            ],
        exports:
            [
                Common
            ],
        entryComponents:
            [
                FacilityTab,
                FacilityTab1,
                KeyCounterparties,
                KeyDealData,
                MoreTabs,
                OriginationTab,
                TransactionDetails
            ]
    })
export class DealModule
{ }
