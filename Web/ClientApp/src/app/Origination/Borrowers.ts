import { Component, ViewChild } from '@angular/core';
import { LegalEntityFinder } from '../LegalEntityFinder';

@Component(
    {
        selector: 'borrowers',
        templateUrl: './Borrowers.html'
    })
export class Borrowers
{
    @ViewChild('legalEntityFinder')
    private _legalEntityFinder: LegalEntityFinder;

    Add(): void
    {
        this._legalEntityFinder.Find(() => { });
    }
}
