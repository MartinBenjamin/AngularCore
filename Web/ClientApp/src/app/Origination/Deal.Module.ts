import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccrualDateEditor } from '../AccrualDateEditor';
import { AccrualDatePipe } from '../AccrualDatePipe';
import { DateModule } from '../Components/DateModule';
import { DialogModule } from '../Components/Dialog';
import { ErrorModule } from '../Components/ErrorModule';
import { NumberModule } from '../Components/NumberModule';
import { TabbedViewModule } from '../Components/TabbedView';
import { YesNoPipe } from '../Components/YesNoPipe';
import { Borrowers } from '../Deal/Borrowers';
import { ExternalFunding } from '../Deal/ExternalFunding';
import { Facility } from '../Deal/Facility';
import { FacilityErrors } from '../Deal/FacilityErrors';
import { FacilityFeeEditor } from '../Deal/FacilityFeeEditor';
import { FacilityFeeErrors } from '../Deal/FacilityFeeErrors';
import { FacilityFees } from '../Deal/FacilityFees';
import { FacilityTab } from '../Deal/FacilityTab';
import { FacilityTab1 } from '../Deal/FacilityTab1';
import { FacilityTab3 } from '../Deal/FacilityTab3';
import { GeographicRegionSelector } from '../Deal/GeographicRegionSelector';
import { Sponsors } from '../Deal/Sponsors';
import { Sponsors_s } from '../Deal/Sponsors_s';
import { LegalEntityFinder, LegalEntityFinderButtons } from '../LegalEntityFinder';
import { Common } from './Common';
import { DealGeographicRegion } from './DealGeographicRegion';
import { Exclusivity } from './Exclusivity';
import { Facilities } from './Facilities';
import { KeyCounterparties } from './KeyCounterparties';
import { KeyDealData } from './KeyDealData';
import { MoreTabs } from './MoreTabs';
import { OriginationTab } from './OriginationTab';
import { TransactionDetails } from './TransactionDetails';
import { Restricted } from './Restricted';

@NgModule(
    {
        declarations:
            [
                AccrualDateEditor,
                AccrualDatePipe,
                Borrowers,
                Common,
                DealGeographicRegion,
                Exclusivity,
                ExternalFunding,
                Facilities,
                Facility,
                FacilityErrors,
                FacilityFeeEditor,
                FacilityFeeErrors,
                FacilityFees,
                FacilityTab,
                FacilityTab1,
                FacilityTab3,
                GeographicRegionSelector,
                KeyCounterparties,
                KeyDealData,
                LegalEntityFinder,
                LegalEntityFinderButtons,
                MoreTabs,
                OriginationTab,
                Restricted,
                Sponsors,
                Sponsors_s,
                TransactionDetails,
                YesNoPipe
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
            ]
    })
export class DealModule
{ }
