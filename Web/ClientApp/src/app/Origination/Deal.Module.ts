import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TabbedViewModule } from '../Gallery/TabbedView';
import { Facilities } from './Facilities';
import { KeyDealData } from './KeyDealData';
import { MoreTabs } from './MoreTabs';
import { OriginationTab } from './OriginationTab';
import { TransactionDetails } from './TransactionDetails';


@NgModule(
    {
        declarations:
            [
                Facilities,
                KeyDealData,
                MoreTabs,
                OriginationTab,
                TransactionDetails
            ],
        imports:
            [
                CommonModule,
                TabbedViewModule
            ],
        entryComponents:
            [
                KeyDealData,
                MoreTabs,
                OriginationTab,
                TransactionDetails
            ]
    })
export class DealModule
{ }
