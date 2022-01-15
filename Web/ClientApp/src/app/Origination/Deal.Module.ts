import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DateModule } from '../Components/DateModule';
import { DialogModule } from '../Components/Dialog';
import { ErrorModule } from '../Components/ErrorModule';
import { NumberModule } from '../Components/NumberModule';
import { TabbedViewModule } from '../Components/TabbedView';
import { YesNoPipeModule } from '../Components/YesNoPipe';
import { DealComponentsModule } from '../Deal/DealComponents.Module';
import { Common } from './Common';
import { DealGeographicRegion } from './DealGeographicRegion';
import { Exclusivity } from './Exclusivity';
import { Facilities } from './Facilities';
import { KeyCounterparties } from './KeyCounterparties';
import { KeyDealData } from './KeyDealData';
import { MoreTabs } from './MoreTabs';
import { OriginationTab } from './OriginationTab';
import { Restricted } from './Restricted';
import { TransactionDetails } from './TransactionDetails';

@NgModule(
    {
        declarations:
            [
                Common,
                DealGeographicRegion,
                Exclusivity,
                Facilities,
                KeyCounterparties,
                KeyDealData,
                MoreTabs,
                OriginationTab,
                Restricted,
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
                TabbedViewModule,
                YesNoPipeModule
            ],
        exports:
            [
                Common
            ]
    })
export class DealModule
{ }
