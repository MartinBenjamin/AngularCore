import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { DateModule } from '../../Components/DateModule';
import { DialogModule } from '../../Components/Dialog';
import { ErrorModule } from '../../Components/ErrorModule';
import { NumberModule } from '../../Components/NumberModule';
import { TabbedViewModule } from '../../Components/TabbedView';
import { YesNoPipeModule } from '../../Components/YesNoPipe';
import { GeographicRegionSelectorModule } from '../../GeographicRegionSelector.Module';
import { LegalEntityFinderModule } from '../../LegalEntityFinder.Module';
import { DealOntologyServiceProvider } from '../../Ontologies/DealOntologyServiceProvider';
import { DealBuilderProvider } from '../../Ontologies/IDealBuilder';
import { Borrowers } from './Borrowers';
import { Common } from './Common';
import { Deal } from './Deal';
import { DealGeographicRegion } from './DealGeographicRegion';
import { EavStoreProvider } from './EavStoreProvider';
import { Errors } from './Errors';
import { Exclusivity } from './Exclusivity';
import { ExternalFunding } from './ExternalFunding';
import { Facilities } from './Facilities';
import { Facility } from './Facility';
import { FacilityErrors } from './FacilityErrors';
import { FacilityFeeEditor } from './FacilityFeeEditor';
import { FacilityFeeErrors } from './FacilityFeeErrors';
import { FacilityFees_s } from './FacilityFees_s';
import { FacilityTab } from './FacilityTab';
import { FacilityTab1 } from './FacilityTab1';
import { FacilityTab3 } from './FacilityTab3';
import { KeyCounterparties } from './KeyCounterparties';
import { KeyDealData } from './KeyDealData';
import { MoreTabs } from './MoreTabs';
import { OriginationTab } from './OriginationTab';
import { Restricted_s } from './Restricted_s';
import { Sponsors_s } from './Sponsors_s';
import { TransactionDetails } from './TransactionDetails';

const routes: Routes =
    [
        {
            path: '',
            component: Deal,
            outlet: 'feature'
        }
    ];

@NgModule(
    {
        declarations:
            [
                Deal,
                Borrowers,
                Common,
                DealGeographicRegion,
                Errors,
                Exclusivity,
                ExternalFunding,
                Facilities,
                Facility,
                FacilityErrors,
                FacilityFeeEditor,
                FacilityFeeErrors,
                FacilityFees_s,
                FacilityTab,
                FacilityTab1,
                FacilityTab3,
                KeyCounterparties,
                KeyDealData,
                MoreTabs,
                OriginationTab,
                Restricted_s,
                Sponsors_s,
                TransactionDetails
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
                RouterModule.forChild(routes),
                TabbedViewModule,
                YesNoPipeModule
            ],
        providers:
            [
                DealOntologyServiceProvider,
                DealBuilderProvider,
                EavStoreProvider
            ]
    })
export class DealModule
{ }
