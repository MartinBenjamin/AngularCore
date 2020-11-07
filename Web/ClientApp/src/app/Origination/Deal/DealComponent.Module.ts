import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabbedViewModule } from '../../Components/TabbedView';
import { DealOntologyServiceProvider } from '../../Ontologies/DealOntologyServiceProvider';
import { projectFinance } from '../../Ontologies/ProjectFinance';
import { DealModule } from '../Deal.Module';
import { DealComponent, DealOntologyToken } from './DealComponent';

const routes: Routes =
    [
        {
            path: '',
            component: DealComponent,
            outlet: 'feature'
        }
    ];

@NgModule(
    {
        declarations:
            [
                DealComponent
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
                {
                    provide: DealOntologyToken,
                    useValue: projectFinance
                },
                DealOntologyServiceProvider
            ]
    })
export class DealComponentModule
{ }
