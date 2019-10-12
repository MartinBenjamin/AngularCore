import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { CounterComponent } from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { TabbedViewModule } from './Gallery/TabbedView';
import { GalleryModule } from './Gallery/GalleryModule';
import { Gallery } from './Gallery/Gallery'
import { DealTracker } from './DealTracker';
import { KeyDealData } from './KeyDealData';
import { OriginationTab } from './OriginationTab';
import { MoreTabs } from './MoreTabs';
import { CurrenciesToken, CurrencyServiceProvider, CurrencyServiceUrlToken, CurrenciesProvider } from './CurrencyServiceProvider';


@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    CounterComponent,
    FetchDataComponent,
    DealTracker,
    KeyDealData,
    OriginationTab,
    MoreTabs
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    TabbedViewModule,
    GalleryModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'counter', component: CounterComponent },
      { path: 'fetch-data', component: FetchDataComponent },
      { path: 'gallery', component: Gallery }
    ])
  ],
  entryComponents:
  [
    KeyDealData,
    OriginationTab,
    MoreTabs
  ],
  providers:
  [
    {
      provide : CurrencyServiceUrlToken,
      useValue: '/api/currencies'
      },
      CurrencyServiceProvider,
      CurrenciesProvider
  ],
  bootstrap: [DealTracker]
})
export class AppModule { }
