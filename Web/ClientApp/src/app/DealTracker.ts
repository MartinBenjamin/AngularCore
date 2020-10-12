import { Component, TemplateRef } from '@angular/core';
import { RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';
import { Ontology } from './Ontology/IOntology';

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
        console.log("Before");
        let o = new Ontology();
        for(let x of o.GetOntologies())
        {
            console.log("In loop");
            if(x === o)
                console.log("Equal");
            else
                console.log("Not Equal");
        }
        var x = o.GetOntologies();
        console.log(typeof x);
        console.log("After");
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
