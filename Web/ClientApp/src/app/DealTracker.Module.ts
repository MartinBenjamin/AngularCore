import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ClassificationSchemeServiceProvider, ClassificationSchemeServiceUrlToken } from './ClassificationSchemeServiceProvider';
import { Gallery } from './Components/Gallery';
import { GalleryModule } from './Components/GalleryModule';
import { CurrenciesProvider, CurrencyServiceProvider, CurrencyServiceUrlToken } from './CurrencyServiceProvider';
import { DealTracker } from './DealTracker';
import { GeographicRegionHierarchyProvider, GeographicRegionHierarchyServiceProvider, GeographicRegionHierarchyServiceUrlToken } from './GeographicRegionHierarchyProvider';
import { DealLifeCycleServiceProvider, DealLifeCycleServiceUrlToken } from './IDealLifeCycleService';
import { LegalEntityServiceProvider, LegalEntityServiceUrlToken } from './LegalEntityServiceProvider';
import { RoleServiceProvider, RoleServiceUrlToken, RolesProvider } from './RoleServiceProvider';

@NgModule({
    declarations:
        [
            DealTracker
        ],
    imports:
        [
            BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
            HttpClientModule,
            FormsModule,
            GalleryModule,
            RouterModule.forRoot([
                {
                    path: '',
                    redirectTo: '/Home',
                    pathMatch: 'full'
                },
                {
                    path: 'Home',
                    loadChildren: () => import('./Home/Home.Module').then(
                        module => module.HomeModule)
                },
                {
                    path: 'Origination',
                    loadChildren: () => import('./Origination/Origination.Module').then(
                        module => module.OriginationModule)
                },
                {
                    path: 'AssetManagement',
                    loadChildren: () => import('./AssetManagement/AssetManagement.Module').then(
                        module => module.AssetManagementModule)
                },
                {
                    path: 'Gallery',
                    component: Gallery
                }
            ])
        ],
    providers:
        [
            {
                provide: CurrencyServiceUrlToken,
                useValue: '/api/currencies'
            },
            CurrencyServiceProvider,
            CurrenciesProvider,
            {
                provide: RoleServiceUrlToken,
                useValue: '/api/roles'
            },
            RoleServiceProvider,
            RolesProvider,
            {
                provide: LegalEntityServiceUrlToken,
                useValue: '/api/legalentities'
            },
            LegalEntityServiceProvider,
            {
                provide: ClassificationSchemeServiceUrlToken,
                useValue: '/api/classificationschemes'
            },
            ClassificationSchemeServiceProvider,
            {
                provide: GeographicRegionHierarchyServiceUrlToken,
                useValue: '/api/geographicregionhierarchies'
            },
            GeographicRegionHierarchyServiceProvider,
            GeographicRegionHierarchyProvider,
            {
                provide: DealLifeCycleServiceUrlToken,
                useValue: '/api/deallifecycles'
            },
            DealLifeCycleServiceProvider
        ],
    bootstrap: [DealTracker]
})
export class DealTrackerModule
{ }
