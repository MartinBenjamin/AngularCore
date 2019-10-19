import { Component, TemplateRef } from '@angular/core';
import { RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';

@Component(
    {
        selector: 'body',
        templateUrl: './DealTracker.html'
    })
export class DealTracker
{
    private _title: TemplateRef<any>

    constructor(
        router: Router
        )
    {
        router.events.subscribe(
            event =>
            {
                if(event instanceof RouteConfigLoadStart)
                    console.log('Loading');

                else if(event instanceof RouteConfigLoadEnd)
                    console.log('Loaded');
            });
    }

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
