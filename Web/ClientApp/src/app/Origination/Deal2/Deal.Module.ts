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
import { FacilityAgreementEditor } from './FacilityAgreementEditor';
import { FacilityAgreements } from './FacilityAgreements';
import { FacilityErrors } from './FacilityErrors';
import { FacilityFeeEditor } from './FacilityFeeEditor';
import { FacilityFeeErrors } from './FacilityFeeErrors';
import { FacilityFees } from './FacilityFees';
import { FacilityTab } from './FacilityTab';
import { FacilityTab1 } from './FacilityTab1';
import { FacilityTab3 } from './FacilityTab3';
import { FeeEditor } from './FeeEditor';
import { Fees } from './Fees';
import { FeesTab } from './FeesTab';
import { KeyCounterparties } from './KeyCounterparties';
import { KeyDates } from './KeyDates';
import { KeyDealData } from './KeyDealData';
import { MoreTabs } from './MoreTabs';
import { OriginationTab } from './OriginationTab';
import { Restricted } from './Restricted';
import { Sponsors } from './Sponsors';
import { TransactionDetails } from './TransactionDetails';
import { FacilityAgreementErrors } from './FacilityAgreementErrors';

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
                FacilityAgreementEditor,
                FacilityAgreementErrors,
                FacilityAgreements,
                FacilityErrors,
                FacilityFeeEditor,
                FacilityFeeErrors,
                FacilityFees,
                FacilityTab,
                FacilityTab1,
                FacilityTab3,
                FeeEditor,
                FeesTab,
                Fees,
                KeyCounterparties,
                KeyDates,
                KeyDealData,
                MoreTabs,
                OriginationTab,
                Restricted,
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
