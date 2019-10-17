import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TabbedViewModule } from '../Gallery/TabbedView';
import { KeyDealData } from './KeyDealData';
import { MoreTabs } from './MoreTabs';
import { OriginationTab } from './OriginationTab';
import { ProjectFinance } from './ProjectFinance';


@NgModule(
    {
        declarations:
            [
                KeyDealData,
                MoreTabs,
                OriginationTab,
                ProjectFinance
            ],
        imports:
            [
                CommonModule,
                TabbedViewModule
            ],
        exports:
            [
                KeyDealData,
                MoreTabs,
                OriginationTab,
                ProjectFinance
            ],
        entryComponents:
            [
                KeyDealData,
                OriginationTab,
                MoreTabs
            ]
    })
export class DealModule
{ }
