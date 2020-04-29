import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Borrowers } from '../Deal/Borrowers';
import { Sponsors } from '../Deal/Sponsors';
import { DialogModule } from '../Components/Dialog';
import { TabbedViewModule } from '../Components/TabbedView';
import { LegalEntityFinder, LegalEntityFinderButtons } from '../LegalEntityFinder';
import { Facilities } from './Facilities';
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
