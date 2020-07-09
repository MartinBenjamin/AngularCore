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
                        [(ngModel)]="SubRegion">
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
                        [(ngModel)]="Country">
                        <option [ngValue]="null"></option>
                        <ng-container *ngFor="let geograhicRegion of Countries">
                            <option
                                *ngIf="geograhicRegion.Member.$type == 'Web.Model.Country, Web';else IntermediateRegion"
                                [ngValue]="geograhicRegion">
                                {{geograhicRegion.Member.Name}}
                            </option>
                            <ng-template #IntermediateRegion>
                                <optgroup
                                    [label]="geograhicRegion.Member.Name">
                                    <option
                                        *ngFor="let country of geograhicRegion.Children"
                                        [ngValue]="country">
                                        {{country.Member.Name}}
                                    </option>
                                </optgroup>
                            </ng-template>
                        </ng-container>
                    </select>
                </td>
            <tr>
            <tr *ngIf="Subdivisions" class="Subsequent">
                <td class="RowHeading">Subdivision:</td>
                <td>
                    <select
                        [ngModel]="null"
                        (ngModelChange)="SubdivisionChanged($event)">
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
    <dt-dialog-buttons><input type="button" value="Apply" (click)="Apply()" [disabled]="!Country" class="Button"
        /><input type="button" value="Cancel" (click)="Cancel()" class="Button" /></dt-dialog-buttons>
</dt-dialog>`
    })
export class GeographicRegionSelector implements OnDestroy
{
    private _subscriptions: Subscription[] = [];
    private _regions      : GeographicRegionHierarchyMember[];
    private _countries    : GeographicRegionHierarchyMember[];
    private _subdivisions : GeographicRegionHierarchyMember[];
    private _subRegion    : GeographicRegionHierarchyMember;
    private _country      : GeographicRegionHierarchyMember;
    private _select       : (geographicRegion: GeographicRegion) => void


    constructor(
        @Inject(GeographicRegionHierarchyToken)
        geographicRegionHierarchy: Observable<GeographicRegionHierarchy>
        )
    {
        this._subscriptions.push(
            geographicRegionHierarchy.subscribe(
                result => this._regions = result.Members
                    .find(geographicRegionHierarchyMember => geographicRegionHierarchyMember.Parent == null).Children
                    .filter(geographicRegionHierarchyMember => geographicRegionHierarchyMember.Children.length)));
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
        if(!country.Children.length)
        {
            this._select(country.Member);
            this.Close();
        }
        else
        {
            this._country = country;
            this.ResetSubdivision();
        }
    }

    get Open(): boolean
    {
        return this._select != null;
    }

    SubdivisionChanged(
        subdivision: GeographicRegionHierarchyMember
        ): void
    {
        this._select(subdivision.Member);
        this.Close();
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
            this._countries = this._subRegion.Children;

        this.ResetSubdivision();
    }

    private ResetSubdivision()
    {
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

    Apply(): void
    {
        this._select(this._country.Member);
        this.Close();
    }

    Cancel(): void
    {
        this.Close();
    }

    protected Close(): void
    {
        this._select = null;
        this.ResetSubRegion();
    }
}
