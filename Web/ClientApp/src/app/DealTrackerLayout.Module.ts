import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AreaTitle, DealTrackerLayout, FeatureTitle, MenuContainer } from './DealTrackerLayout';

@NgModule(
    {
        declarations:
            [
                AreaTitle,
                DealTrackerLayout,
                FeatureTitle,
                MenuContainer
            ],
        imports:
            [
                CommonModule,
                RouterModule
            ],
        exports:
            [
                AreaTitle,
                DealTrackerLayout,
                FeatureTitle,
                MenuContainer
            ]
    })
export class DealTrackerLayoutModule
{ }
