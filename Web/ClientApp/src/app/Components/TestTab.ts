import { Component } from '@angular/core';
import { TabbedView } from './TabbedView';
//import { Gallery } from './Gallery';

export var model =
[
    ['ABC', null],
    ['DEF', null]
];

@Component(
    {
        template: `<input type="text" [ngModel]="Model[0]" [dtModelErrors]="Model[1]"/>`
    })
export class TestTab0
{
    Model: [string, any];

    constructor()
    {
        this.Model = <[string, any]>model[0];
    }
}

@Component(
    {
        template: `<input type="text" [ngModel]="Model[0]" [dtModelErrors]="Model[1]"/>`
    })
export class TestTab1
{
    Model: [string, any];

    constructor()
    {
        this.Model = <[string, any]>model[1];
    }
}
