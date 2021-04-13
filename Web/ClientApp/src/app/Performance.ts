import { Component } from '@angular/core';

@Component(
    {
        selector: 'performance',
        template: `
<div style="position: absolute; left: 0px; top: 0px; background-color: black; border: 1px solid white;" *ngIf="Entries" (click)="Collapse()">
  <table>
    <tr><td>Event</td><td>Offset</td></tr>
    <tr
      *ngFor="let entry of Entries">
      <td>{{entry[0]}}</td>
      <td>{{entry[1]}}</td>
    </tr>
  </table>
</div><a (click)="Expand()">&nbsp;</a>`
    })
export class Performance
{
    private static _marks =
        [
            'bootstrapStart',
            'bootstrapEnd'
        ];

    private _entries: [string, number][];

    Expand(): void
    {
        this._entries = [];
        let timing = window.performance.timing;
        let navigationStart = timing.navigationStart;
        for(let key in timing)
        {
            let value = timing[key];
            if(typeof value === 'number' &&
               value >= navigationStart)
                this._entries.push([key, value - navigationStart]);
        }

        Performance._marks.forEach(
            markName =>
            {
                let performanceEntry = window.performance.getEntriesByName(
                    markName,
                    'mark')[0];

                if(performanceEntry)
                    this._entries.push([markName, Math.floor(performanceEntry.startTime + 0.5)]);
            });

        this._entries.sort((a, b) => a[1] - b[1]);
    }

    Collapse(): void
    {
        this._entries = null;
    }

    get Entries(): [string, number][]
    {
        return this._entries;
    }
}
