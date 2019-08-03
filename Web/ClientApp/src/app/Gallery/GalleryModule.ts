import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AssessmentViewer } from './AssessmentViewer';
import { DateModule } from './DateModule';
import { DialogModule } from './Dialog';
import { ErrorModule } from './ErrorModule';
import { Gallery } from './Gallery';
import { NumberModule } from './NumberModule';
import { OrganisationalUnitSelectorModule } from './OrganisationalUnitSelector';
import { OrganisationalUnitSelectorModuleV2 } from './OrganisationalUnitSelectorV2';
import { TabbedViewModule } from './TabbedView';
import { TestTab } from './TestTab';
import { TextModel } from './TextModel';

@NgModule(
{
    imports:
    [
        BrowserModule,
        FormsModule,
        DateModule,
        NumberModule,
        DialogModule,
        TabbedViewModule,
        OrganisationalUnitSelectorModule,
        OrganisationalUnitSelectorModuleV2,
        ErrorModule
    ],
    declarations:
    [
        Gallery,
        TextModel,
        TestTab,
        AssessmentViewer
    ],
    entryComponents:
    [
        TestTab
    ],
    bootstrap:
    [
        Gallery
    ]
})
export class GalleryModule
{ }
