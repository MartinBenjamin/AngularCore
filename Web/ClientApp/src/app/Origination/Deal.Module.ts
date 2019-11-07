import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KeyDealData } from './KeyDealData';
import { OriginationTab } from './OriginationTab';
import { MoreTabs } from './MoreTabs';
import { TabbedViewModule } from '../Gallery/TabbedView';


@NgModule(
    {
        declarations:
            [
                KeyDealData,
                MoreTabs,
                OriginationTab
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
                OriginationTab
            ]
    })
export class DealModule
{ }
