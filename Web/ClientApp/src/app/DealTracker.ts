import { Component } from '@angular/core';
import { RouteConfigLoadStart, RouteConfigLoadEnd, Router } from '@angular/router';

@Component(
    {
        selector: 'body',
        templateUrl: './DealTracker.html'
    })
export class DealTracker
{
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
}
