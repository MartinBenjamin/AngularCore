import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { Errors } from './Errors';
import { HighlightedServiceProvider, HighlighterServiceProvider, ModelErrors } from './ModelErrors';
import { ValidatedProperty } from './ValidatedProperty';

@NgModule(
    {
        imports:
        [
            CommonModule
        ],
        declarations:
        [
            Errors,
            ModelErrors,
            ValidatedProperty
        ],
        exports:
        [
            Errors,
            ModelErrors,
            ValidatedProperty
        ],
        providers:
        [
            HighlighterServiceProvider,
            HighlightedServiceProvider
        ]
    })
export class ErrorModule
{ }
