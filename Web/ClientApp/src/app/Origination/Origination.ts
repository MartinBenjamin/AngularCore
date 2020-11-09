import { Component, TemplateRef } from '@angular/core';
import { DealType } from '../Deals';
import { BehaviorSubject } from 'rxjs';

@Component(
    {
        selector: '',
        templateUrl: './Origination.html'
    })
export class Origination
{
    private readonly _title = new BehaviorSubject<TemplateRef<any>>(null);

    DealTypes: DealType[] =
        [
            {
                Id: null,
                Name: 'Advisory',
                Advisory: true
            },
            {
                Id: null,
                Name: 'Aviation Finance'
            },
            {
                Id: null,
                Name: 'Leveraged Finance'
            },
            {
                Id: null,
                Name: 'Project Finance'
            }
        ];

    get Title(): BehaviorSubject<TemplateRef<any>>
    {
        return this._title;
    }
}
