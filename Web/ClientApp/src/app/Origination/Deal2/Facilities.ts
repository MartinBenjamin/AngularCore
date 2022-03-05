import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ClassificationScheme } from '../../ClassificationScheme';
import { ClassificationSchemeServiceToken } from '../../ClassificationSchemeServiceProvider';
import { Guid } from '../../CommonDomainObjects';
import { HighlightedPropertyObservableToken, Property } from '../../Components/ValidatedProperty';
import { DealProvider } from '../../DealProvider';
import { ClassificationSchemeIdentifier, Deal } from '../../Deals';
import { Facility, FacilityType, LenderParticipation } from '../../FacilityAgreements';
import { IDomainObjectService } from '../../IDomainObjectService';
import { Store } from '../../Ontology/IEavStore';

@Component(
    {
        selector: 'facilities',
        templateUrl: './Facilities.html'
    })
export class Facilities implements OnDestroy
{
    private _subscriptions: Subscription[] = [];
    private _deal         : Deal;
    private _facilities   : [Facility, LenderParticipation][]
    private _facilityTypes: FacilityType[];
    private _facilityType : FacilityType;

    @ViewChild('facility', { static: true })
    private _facility: import('./Facility').Facility;

    constructor(
        dealProvider: DealProvider,
        @Inject(HighlightedPropertyObservableToken)
        highlightedPropertyService: Observable<Property>,
        @Inject(ClassificationSchemeServiceToken)
        classificationSchemeService: IDomainObjectService<Guid, ClassificationScheme>,
        )
    {
        this._subscriptions.push(
            dealProvider.subscribe(
                deal =>
                {
                    this._deal = deal;
                    this._facilityType = null;

                    if(this._deal)
                    {
                        const store = Store(this._deal);
                        classificationSchemeService
                            .Get(ClassificationSchemeIdentifier.FacilityType)
                            .subscribe(
                                classificationScheme =>
                                    this._facilityTypes = classificationScheme
                                        .Classifiers
                                        .map(classificationSchemeClassifier => <FacilityType>store.Assert(classificationSchemeClassifier.Classifier))
                                        .sort((a, b) => a.Name.localeCompare(b.Name)))

                    }

                    this.ComputeFacilities();
                }),
            highlightedPropertyService.subscribe(
                highlightedProperty =>
                {                    
                    if(this._facilities)
                    {
                        let highlighted = this._facilities.find(tuple => tuple[0] === highlightedProperty[0]);
                        if(highlighted)
                            this.Update(highlighted[0]);
                    }
                }));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get FacilityTypes(): FacilityType[]
    {
        return this._facilityTypes;
    }

    get FacilityType(): FacilityType
    {
        return this._facilityType;
    }

    set FacilityType(
        facilityType: FacilityType
        )
    {
        this._facilityType = facilityType;
    }

    get Facilities(): [Facility, LenderParticipation][]
    {
        return this._facilities;
    }

    Add(): void
    {
        this._facility.Create(
            this._facilityType,
            () => this.ComputeFacilities());
    }

    Update(
        facility: Facility
        ): void
    {
        this._facility.Update(
            facility,
            () => this.ComputeFacilities());
    }

    Delete(
        facility: Facility
        ): void
    {
        if(confirm(`Delete Facility ${facility.Name}?`))
        {
            this._deal.Commitments.splice(
                this._deal.Commitments.indexOf(facility),
                1);

            this.ComputeFacilities();
        }
    }

    private ComputeFacilities(): void
    {
        if(!this._deal)
        {
            this._facilities = null;
            return;
        }

        this._facilities = this._deal.Commitments
            .filter((commitment): commitment is Facility => (<any>commitment).$type == 'Web.Model.Facility, Web')
            .map(facility =>
                [
                    facility,
                    facility.Parts.find((part): part is LenderParticipation => (<any>part).$type == 'Web.Model.LenderParticipation, Web')
                ]);
    }
}
