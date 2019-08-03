import { Component } from '@angular/core';
import { TabComponent } from './TabbedView';

@Component(
    {
        template: '\
        <input type="text" [ngModel]="Model[0]" [dtModelErrors]="Model[1]"/>'
    })
export class TestTab implements TabComponent
{
    Model: [ string, any ];
}