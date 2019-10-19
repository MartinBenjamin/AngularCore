import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { CurrenciesProvider, CurrencyServiceProvider, CurrencyServiceUrlToken } from './CurrencyServiceProvider';
import { DealTracker } from './DealTracker';
import { Gallery } from './Gallery/Gallery';
import { GalleryModule } from './Gallery/GalleryModule';
import { MyDeals } from './Origination/MyDeals';
import { OriginationModule } from './Origination/OriginationModule';
import { ProjectFinance } from './Origination/ProjectFinance/ProjectFinance';

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
            OriginationModule,
            RouterModule.forRoot([
                { path: '', redirectTo: '/Origination/MyDeals', pathMatch: 'full'  },
                {
                    path: 'Origination',
                    children:
                        [
                            { path: 'MyDeals', component: MyDeals },
                            { path: 'ProjectFinance', component: ProjectFinance }
                        ]
                },
                { path: 'Gallery', component: Gallery }
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
export class AppModule { }
