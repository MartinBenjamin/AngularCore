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
import { DealComponentsModule } from '../../Deal/DealComponents.Module';
import { Sponsors_s } from '../../Deal/Sponsors_s';
import { DealOntologyServiceProvider } from '../../Ontologies/DealOntologyServiceProvider';
import { DealBuilderProvider } from '../../Ontologies/IDealBuilder';
import { Common } from './Common';
import { Deal } from './Deal';
import { DealGeographicRegion } from './DealGeographicRegion';
import { EavStoreProvider } from './EavStoreProvider';
import { Errors } from './Errors';
import { Exclusivity } from './Exclusivity';
import { Facilities } from './Facilities';
import { KeyCounterparties } from './KeyCounterparties';
import { KeyDealData } from './KeyDealData';
import { MoreTabs } from './MoreTabs';
import { OriginationTab } from './OriginationTab';
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
                Common,
                DealGeographicRegion,
                Errors,
                Exclusivity,
                Facilities,
                KeyCounterparties,
                KeyDealData,
                MoreTabs,
                OriginationTab,
                Sponsors_s,
                TransactionDetails
            ],
        imports:
            [
                CommonModule,
                DealComponentsModule,
                DateModule,
                DialogModule,
                ErrorModule,
                FormsModule,
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
