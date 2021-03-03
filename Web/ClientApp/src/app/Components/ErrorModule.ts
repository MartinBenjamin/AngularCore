import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { Errors } from './Errors';
import { HighlightedServiceProvider, HighlighterServiceProvider, ModelErrors } from './ModelErrors';

@NgModule(
    {
        imports:
        [
            CommonModule
        ],
        declarations:
        [
            Errors,
            ModelErrors
        ],
        exports:
        [
            Errors,
            ModelErrors
        ],
        providers:
        [
            HighlighterServiceProvider,
            HighlightedServiceProvider
        ]
    })
export class ErrorModule
{ }
