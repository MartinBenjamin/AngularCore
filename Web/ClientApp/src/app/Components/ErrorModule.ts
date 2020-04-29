import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Errors } from './Errors';
import { ModelErrors } from './ModelErrors';

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
        ]
    })
export class ErrorModule
{ }
