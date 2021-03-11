import { Component } from '@angular/core';

@Component(
    {
        selector: 'select.YesNo',
        template: `
              <option [ngValue]="null"></option>
              <option [ngValue]="true">Yes</option>
              <option [ngValue]="false">No</option>`
    })
export class YesNoSelect
{
}
