import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { CurrenciesProvider, CurrencyServiceProvider, CurrencyServiceUrlToken } from './CurrencyServiceProvider';
import { DealTracker } from './DealTracker';
import { Gallery } from './Gallery/Gallery';
import { GalleryModule } from './Gallery/GalleryModule';

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
                    redirectTo: '/Origination/MyDeals',
                    pathMatch: 'full'
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
            CurrenciesProvider
        ],
    bootstrap: [DealTracker]
})
export class DealTrackerModule
{ }
