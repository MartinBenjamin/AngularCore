import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DialogModule } from '../Components/Dialog';
import { NumberModule } from '../Components/NumberModule';
import { TabbedViewModule } from '../Components/TabbedView';
import { Borrowers } from '../Deal/Borrowers';
import { Sponsors } from '../Deal/Sponsors';
import { LegalEntityFinder, LegalEntityFinderButtons } from '../LegalEntityFinder';
import { Exclusivity } from './Exclusivity';
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
                Exclusivity,
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
                NumberModule,
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
