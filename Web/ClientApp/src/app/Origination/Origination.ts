import { Component, TemplateRef } from '@angular/core';
import { DealType } from '../Deals';

@Component(
    {
        selector: '',
        templateUrl: './Origination.html'
    })
export class Origination
{
    private _title: TemplateRef<any>
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

    set Title(
        title: TemplateRef<any>
        )
    {
        this._title = title;
    }

    get Title(): TemplateRef<any>
    {
        return this._title;
    }
}
