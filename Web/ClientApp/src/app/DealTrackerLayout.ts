import { Component, OnInit, ViewChild, Directive } from '@angular/core';
import { RouterOutlet, Router, ActivationStart } from '@angular/router';

@Directive({ selector: 'area-title' })
export class AreaTitle
{
}

@Directive({ selector: 'feature-title' })
export class FeatureTitle
{
}

@Directive({ selector: 'menu-container' })
export class MenuContainer
{
}

@Component(
    {
        selector: 'deal-tracker-layout',
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
