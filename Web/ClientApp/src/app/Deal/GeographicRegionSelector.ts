import { Component, Inject, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { GeographicRegionHierarchy, GeographicRegionHierarchyMember } from '../GeographicRegionHierarchy';
import { GeographicRegionHierarchyToken } from '../GeographicRegionHierarchyProvider';
import { GeographicRegion } from '../Locations';

@Component(
    {
        selector: 'geographic-region-selector',
        template: `<dt-dialog
    Title="Country Selector"
    [Open]="Open"
    class="NoBorder">
    <dt-dialog-body
        ><table class="GeographicRegionSelector">
            <tbody *ngIf="Regions; else Loading">
                <tr>
                    <td class="RowHeading">Region:</td>
                    <td>
                        <select
                            >
                            <option [ngValue]="null"></option>
                            <optgroup
                                *ngFor="let region of Regions"
                                [label]="region.Member.Name">
                                <option
                                    *ngFor="let child of region.Children"
                                    [ngValue]="child">
                                    {{child.Member.Name}}
                                </option>
                            </optgroup>
                        </select>
                    </td>
                <tr>
            </tbody>
            <ng-template #Loading>
                <tr>
                    <td></td>
                </tr>
            </ng-template>
        </table>
    </dt-dialog-body>
    <dt-dialog-buttons><input type="button" value="Cancel" (click)="Cancel()" class="Button" /></dt-dialog-buttons>
</dt-dialog>`
    })
export class GeographicRegionSelector implements OnDestroy
{
    private _subscriptions            : Subscription[] = [];
    private _geographicRegionHierarchy: GeographicRegionHierarchy;
    private _regions                  : GeographicRegionHierarchyMember[];
    private _countries                : GeographicRegion[];
    private _subdivisions             : GeographicRegion[];
    private _select: (geographicRegion: GeographicRegion) => void


    constructor(
        @Inject(GeographicRegionHierarchyToken)
        geographicRegionHierarchy: Observable<GeographicRegionHierarchy>
        )
    {
        this._subscriptions.push(
            geographicRegionHierarchy.subscribe(
                result =>
                {
                    this._geographicRegionHierarchy = result;
                    this._regions = result.Members.filter(
                        geographicRegionHierarchyMember => geographicRegionHierarchyMember.Parent == null)[0].Children;
                }));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get Open(): boolean
    {
        return this._select != null;
    }

    Select(
        select: (geographicRegion: GeographicRegion) => void
        ): void
    {
        this._select = select;
    }

    get Regions(): GeographicRegionHierarchyMember[]
    {
        return this._regions;
    }

    SelectX(
        geographicRegion: GeographicRegion
        ): void
    {
        this._select(geographicRegion);
        this.Close();
    }

    Cancel(): void
    {
        this.Close();
    }

    protected Close(): void
    {
        this._select = null;
    }
}
