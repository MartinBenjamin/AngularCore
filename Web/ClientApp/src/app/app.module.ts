import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { CounterComponent } from './counter/counter.component';
import { CurrenciesProvider, CurrencyServiceProvider, CurrencyServiceUrlToken } from './CurrencyServiceProvider';
import { DealTracker } from './DealTracker';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { Gallery } from './Gallery/Gallery';
import { GalleryModule } from './Gallery/GalleryModule';
import { TabbedViewModule } from './Gallery/TabbedView';
import { HomeComponent } from './home/home.component';
import { KeyDealData } from './KeyDealData';
import { MoreTabs } from './MoreTabs';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { OriginationTab } from './OriginationTab';
import { Menu } from './Origination/Menu';



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
    MoreTabs,
    Menu
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
