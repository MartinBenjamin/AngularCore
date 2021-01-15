import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ErrorModule } from '../../Components/ErrorModule';
import { TabbedViewModule } from '../../Components/TabbedView';
import { DealOntologyServiceProvider } from '../../Ontologies/DealOntologyServiceProvider';
import { DealBuilderProvider } from '../../Ontologies/IDealBuilder';
import { DealModule } from '../Deal.Module';
import { Deal } from './Deal';

const routes: Routes =
    [
        {
            path: '',
            component: Deal,
            outlet: 'feature'
        }
    ];

@NgModule(
    {
        declarations:
            [
                Deal
            ],
        imports:
            [
                CommonModule,
                RouterModule.forChild(routes),
                DealModule,
                ErrorModule,
                TabbedViewModule
            ],
        providers:
            [
                DealOntologyServiceProvider,
                DealBuilderProvider
            ]
    })
export class DealComponentModule
{ }