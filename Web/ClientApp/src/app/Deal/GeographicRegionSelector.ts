import { Component, Directive, Inject } from '@angular/core';
import { GeographicRegionHierarchyServiceToken } from '../GeographicRegionHierarchyProvider';
import { IDomainObjectService } from '../IDomainObjectService';
import { Guid } from '../CommonDomainObjects';
import { GeographicRegionHierarchy } from '../GeographicRegionHierarchy';
import { GeographicRegion } from '../Locations';
//import { Guid } from './CommonDomainObjects';
//import { INamedService, NamedFilters } from './INamedService';
//import { LegalEntity } from './LegalEntities';
//import { LegalEntityServiceToken } from './LegalEntityServiceProvider';
//import { NamedFinder } from './NamedFinder';


@Component(
    {
        selector: 'geographic-region-selector',
        template: `<dt-dialog
    Title="Country Selector"
    [Open]="Open">
    <dt-dialog-body
        ><table class="GridLayout">
      </table>
    </dt-dialog-body>
    <dt-dialog-buttons><input type="button" value="Cancel" (click)="Cancel()" class="Button" /></dt-dialog-buttons>
</dt-dialog>`
    })
export class GeographicRegionSelector
{
    private _select: (geographicRegion: GeographicRegion) => void

    constructor(
        @Inject(GeographicRegionHierarchyServiceToken)
        geographicRegionHierarchyService: IDomainObjectService<Guid, GeographicRegionHierarchy>
        )
    {
    }

    get Open(): boolean
    {
        return this._select != null;
    }

    Find(
        select: (geographicRegion: GeographicRegion) => void
        ): void
    {
        this._select = select;
    }

    Select(
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
