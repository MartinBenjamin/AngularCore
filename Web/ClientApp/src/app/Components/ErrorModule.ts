import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { Errors } from './Errors';
import { Errors2 } from './Errors2';
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
            Errors2,
            ModelErrors
        ],
        exports:
        [
            Errors,
            Errors2,
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
