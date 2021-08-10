import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabbedViewModule } from '../../Components/TabbedView';
import { DealOntologyServiceProvider } from '../../Ontologies/DealOntologyServiceProvider';
import { DealBuilderProvider } from '../../Ontologies/IDealBuilder';
import { DealModule } from '../Deal.Module';
import { Deal } from './Deal';
import { EavStoreProvider } from './EavStoreProvider';
import { Errors } from './Errors';

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
                Deal,
                Errors
            ],
        imports:
            [
                CommonModule,
                RouterModule.forChild(routes),
                DealModule,
                TabbedViewModule
            ],
        providers:
            [
                DealOntologyServiceProvider,
                DealBuilderProvider,
                EavStoreProvider
            ]
    })
export class DealComponentModule
{ }
