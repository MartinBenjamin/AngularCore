import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet, Router, ActivationStart } from '@angular/router';

@Component(
    {
        selector: 'DealTrackerLayout',
        templateUrl: './DealTrackerLayout.html'
    })
export class DealTrackerLayout implements OnInit
{
    @ViewChild(RouterOutlet)
    private _outlet: RouterOutlet;

    constructor(
        private _router: Router
        )
    {
    }

    ngOnInit()
    {
        this._router.events.subscribe(
            event =>
            {
                if(event instanceof ActivationStart && event.snapshot.outlet === "feature")
                    this._outlet.deactivate();
            });
    }
}
