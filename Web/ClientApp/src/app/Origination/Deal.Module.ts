import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DialogModule } from '../Gallery/Dialog';
import { TabbedViewModule } from '../Gallery/TabbedView';
import { LegalEntityFinder, LegalEntityFinderButtons } from '../LegalEntityFinder';
import { Borrowers } from './Borrowers';
import { Facilities } from './Facilities';
import { KeyCounterparties } from './KeyCounterparties';
import { KeyDealData } from './KeyDealData';
import { MoreTabs } from './MoreTabs';
import { OriginationTab } from './OriginationTab';
import { Sponsors } from './Sponsors';
import { TransactionDetails } from './TransactionDetails';


@NgModule(
    {
        declarations:
            [
                Borrowers,
                Facilities,
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
                DialogModule,
                TabbedViewModule
            ],
        entryComponents:
            [
                KeyCounterparties,
                KeyDealData,
                MoreTabs,
                OriginationTab,
                TransactionDetails
            ]
    })
export class DealModule
{ }
