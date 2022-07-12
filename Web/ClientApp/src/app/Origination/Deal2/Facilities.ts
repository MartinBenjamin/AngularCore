import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { combineLatest, NEVER, Observable, Subscription } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
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
    private _facilities   : Observable<[Facility, LenderParticipation][]>;
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
        this._facilities = dealProvider.pipe(
            switchMap(
                deal => !deal ? NEVER : Store(deal).Observe(
                    ['?commitment', '?part'],
                    [deal, 'Commitments', '?commitment'],
                    ['?commitment', '$type', 'Web.Model.Facility, Web'],
                    ['?commitment', 'Parts', '?part'],
                    ['?part', '$type', 'Web.Model.LenderParticipation, Web'])));

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
                }),
            combineLatest(
                this._facilities,
                highlightedPropertyService.pipe(filter(highlightedProperty => highlightedProperty)),
                (facilities, highlightedProperty) =>
                {
                    let highlighted = facilities.find(tuple => tuple[0] === highlightedProperty[0]);
                    return highlighted ? highlighted[0] : null;
                }).subscribe(highlightedFacility =>
                {
                    if(highlightedFacility)
                        this.Update(highlightedFacility);
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

    get Facilities(): Observable<[Facility, LenderParticipation][]>
    {
        return this._facilities;
    }

    Add(): void
    {
        this._facility.Create(
            this._facilityType,
            () => { });
    }

    Update(
        facility: Facility
        ): void
    {
        this._facility.Update(
            facility,
            () => { });
    }

    Delete(
        facility: Facility
        ): void
    {
        if(confirm(`Delete Facility ${facility.Name}?`))
            this._deal.Commitments.splice(
                this._deal.Commitments.indexOf(facility),
                1);
    }
}
