import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AreaTitle, DealTrackerLayout, FeatureTitle, MenuContainer } from './DealTrackerLayout';
import { Performance } from './Performance';

@NgModule(
    {
        declarations:
            [
                AreaTitle,
                DealTrackerLayout,
                FeatureTitle,
                MenuContainer,
                Performance
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
