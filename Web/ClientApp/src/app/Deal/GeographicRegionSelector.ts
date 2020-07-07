import { Component, Inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Guid } from '../CommonDomainObjects';
import { GeographicRegionHierarchy } from '../GeographicRegionHierarchy';
import { GeographicRegionHierarchyServiceToken } from '../GeographicRegionHierarchyProvider';
import { IDomainObjectService } from '../IDomainObjectService';
import { GeographicRegion } from '../Locations';

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
export class GeographicRegionSelector implements OnDestroy
{
    private _subscriptions            : Subscription[] = [];
    private _geographicRegionHierarchy: GeographicRegionHierarchy;
    private _select                   : (geographicRegion: GeographicRegion) => void

    constructor(
        @Inject(GeographicRegionHierarchyServiceToken)
        geographicRegionHierarchyService: IDomainObjectService<Guid, GeographicRegionHierarchy>
        )
    {
        geographicRegionHierarchyService
            .Get('')
            .subscribe(
                geographicRegionHierarchy =>
                {
                    this._geographicRegionHierarchy = geographicRegionHierarchy;
                    //this._classificationSchemeClassifiers = classificationScheme.Classifiers.filter(
                    //    classificationSchemeClassifier => classificationSchemeClassifier.Super == null);
                    //classificationScheme.Classifiers.forEach(
                    //    classificationSchemeClassifier => this._map.set(
                    //        classificationSchemeClassifier.Classifier,
                    //        classificationSchemeClassifier));
                    //this._yes = this._classificationSchemeClassifiers.filter(
                    //    classificationSchemeClassifier =>
                    //        classificationSchemeClassifier.Classifier.Id == ExclusivityClassifierIdentifier.Yes)[0];
                    //this.ComputeExclusive();
                });
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
