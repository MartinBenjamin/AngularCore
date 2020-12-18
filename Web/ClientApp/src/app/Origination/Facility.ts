import { Component, EventEmitter, Inject, Input, OnDestroy, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { DomainObject, Guid } from '../CommonDomainObjects';
import { ContractualCommitment } from '../Contracts';
import { CurrenciesToken } from '../CurrencyServiceProvider';
import { DealProvider } from '../DealProvider';
import { Deal } from '../Deals';
import * as facilityAgreements from '../FacilityAgreements';
import { Currency } from '../Iso4217';
import { BranchesToken } from '../BranchServiceProvider';
import { Branch } from '../Organisations';

@Component(
    {
        selector: 'facility',
        templateUrl: './Facility.html'
    })
export class Facility implements OnDestroy
{
    private _subscriptions   : Subscription[] = [];
    private _deal            : Deal;
    private _originalFacility: facilityAgreements.Facility;
    private _facility        : facilityAgreements.Facility;

    constructor(
        @Inject(CurrenciesToken)
        private _currencies: Observable<Currency[]>,
        @Inject(BranchesToken)
        private _branches  : Observable<Branch[]>,
        dealProvider       : DealProvider
        )
    {
        this._subscriptions.push(
            dealProvider.subscribe(
                deal =>
                {
                    if(!deal)
                        this._deal = null;

                    else
                        this._deal = deal[0];

                    this._originalFacility = null;
                    this._facility = null;
                }));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get Currencies(): Observable<Currency[]>
    {
        return this._currencies;
    }

    get Branches(): Observable<Branch[]>
    {
        return this._branches;
    }

    get Facility(): facilityAgreements.Facility
    {
        return this._facility;
    }

    @Input()
    set Facility(
        facility: facilityAgreements.Facility
        )
    {
        if(!facility)
            return;

        this._originalFacility = facility;
        this._facility = <facilityAgreements.Facility>this.CopyCommitment(this._originalFacility);
    }

    @Output()
    FacilityChange = new EventEmitter<facilityAgreements.Facility>();

    Save(): void
    {
    }

    Cancel(): void
    {
        this._originalFacility = null;
        this._facility = null;
        this.FacilityChange.emit(null);
    }

    CompareById(
        lhs: DomainObject<Guid>,
        rhs: DomainObject<Guid>
        )
    {
        return lhs === rhs || (lhs && rhs && lhs.Id === rhs.Id);
    }

    private CopyCommitment(
        commitment: ContractualCommitment,
        partOf   ?: ContractualCommitment
        ): ContractualCommitment
    {
        let copy = <ContractualCommitment>{ ...commitment, PartOf: partOf };
        if(commitment.Parts)
            copy.Parts = commitment.Parts.map(
                part => this.CopyCommitment(
                    part,
                    copy));
        return copy;
    }
}
