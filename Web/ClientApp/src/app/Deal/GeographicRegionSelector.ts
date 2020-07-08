import { Component, Inject, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { GeographicRegionHierarchy, GeographicRegionHierarchyMember } from '../GeographicRegionHierarchy';
import { GeographicRegionHierarchyToken } from '../GeographicRegionHierarchyProvider';
import { GeographicRegion } from '../Locations';

@Component(
    {
        selector: 'geographic-region-selector',
        template: `
<style type="text/css">
    table.GeographicRegionSelector
    {
        border-collapse: collapse;
    }

    table.GeographicRegionSelector tr.Subsequent td
    {
        padding-top: 1px;
    }
</style>
<dt-dialog
    Title="Country Selector"
    [Open]="Open"
    class="NoBorder">
    <dt-dialog-body
        ><table class="GeographicRegionSelector">
            <tr *ngIf="Regions">
                <td class="RowHeading">Region:</td>
                <td>
                    <select
                        [(ngModel)]="SubRegion"
                        >
                        <option [ngValue]="null"></option>
                        <optgroup
                            *ngFor="let region of Regions"
                            [label]="region.Member.Name">
                            <option
                                *ngFor="let subRegion of region.Children"
                                [ngValue]="subRegion">
                                {{subRegion.Member.Name}}
                            </option>
                        </optgroup>
                    </select>
                </td>
            <tr>
            <tr *ngIf="Countries" class="Subsequent">
                <td class="RowHeading">Country:</td>
                <td>
                    <select
                        [(ngModel)]="Country"
                        >
                        <option [ngValue]="null"></option>
                        <option
                            *ngFor="let country of Countries"
                            [ngValue]="country">
                            {{country.Member.Name}}
                        </option>
                    </select>
                </td>
            <tr>
            <tr *ngIf="Subdivisions" class="Subsequent">
                <td class="RowHeading">Subdivision:</td>
                <td>
                    <select
                        [(ngModel)]="Subdivision"
                        >
                        <option [ngValue]="null"></option>
                        <option
                            *ngFor="let subdivision of Subdivisions"
                            [ngValue]="subdivision">
                            {{subdivision.Member.Name}}
                        </option>
                    </select>
                </td>
            <tr>
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
    private _countries                : GeographicRegionHierarchyMember[];
    private _subdivisions             : GeographicRegionHierarchyMember[];
    private _subRegion                : GeographicRegionHierarchyMember;
    private _country                  : GeographicRegionHierarchyMember;
    private _subdivision              : GeographicRegionHierarchyMember;
    private _select                   : (geographicRegion: GeographicRegion) => void


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
                    this._regions = result.Members
                        .filter(geographicRegionHierarchyMember => geographicRegionHierarchyMember.Parent == null)[0].Children
                        .filter(geographicRegionHierarchyMember => geographicRegionHierarchyMember.Children.length);
                }));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get Regions(): GeographicRegionHierarchyMember[]
    {
        return this._regions;
    }

    get Countries(): GeographicRegionHierarchyMember[]
    {
        return this._countries;
    }

    get Subdivisions(): GeographicRegionHierarchyMember[]
    {
        return this._subdivisions;
    }

    get SubRegion(): GeographicRegionHierarchyMember
    {
        return this._subRegion;
    }

    set SubRegion(
        subRegion: GeographicRegionHierarchyMember
        )
    {
        this._subRegion = subRegion;
        this.ResetCountry();
    }

    get Country(): GeographicRegionHierarchyMember
    {
        return this._country;
    }

    set Country(
        country: GeographicRegionHierarchyMember
        )
    {
        this._country = country;
        this.ResetSubdivision();
    }

    get Subdivision(): GeographicRegionHierarchyMember
    {
        return this._subdivision;
    }

    set Subdivision(
        subdivision: GeographicRegionHierarchyMember
    )
    {
        this._subdivision = subdivision;
    }

    get Open(): boolean
    {
        return this._select != null;
    }

    private ResetSubRegion()
    {
        this._subRegion = null;
        this.ResetCountry();
    }

    private ResetCountry()
    {
        this._country = null;
        this._countries = null;

        if(this._subRegion)
            this._countries = this._subRegion.Children.reduce<GeographicRegionHierarchyMember[]>(
                (countries, geographicRegionHierarchyMember) =>
                {
                    if((<any>geographicRegionHierarchyMember.Member).$type == 'Web.Model.Country, Web')
                        countries.push(geographicRegionHierarchyMember);

                    else
                        geographicRegionHierarchyMember.Children.forEach(country => countries.push(country));

                    return countries;
                },
                []);

        this.ResetSubdivision();
    }

    private ResetSubdivision()
    {
        this._subdivision = null;
        this._subdivisions = null;

        if(this._country != null && this._country.Children.length)
            this._subdivisions = this._country.Children;
    }

    Select(
        select: (geographicRegion: GeographicRegion) => void
        ): void
    {
        this._select = select;
        this.ResetSubRegion();
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
