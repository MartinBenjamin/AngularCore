import { Component, Inject } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ContractualCommitment } from '../Contracts';
import { Query, Empty } from '../RegularPathExpression';
import { Facility, FacilityFee, FeeType } from '../FacilityAgreements';
import { EmptyGuid } from '../CommonDomainObjects';
import { FacilityProvider } from '../FacilityProvider';


type ApplyCallback = () => void;

@Component(
    {
        selector: 'facility-fee-editor',
        templateUrl: './FacilityFeeEditor.html'
    })
export class FacilityFeeEditor
{
    private _subscriptions: Subscription[] = [];
    private _facility     : Facility;
    private _fee          : FacilityFee;

    constructor(
        facilityProvider: FacilityProvider
        )
    {
        this._subscriptions.push(facilityProvider.subscribe(facility => this._facility = facility));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get Fee(): FacilityFee
    {
        return this._fee;
    }

    Create(
        feeType      : FeeType,
        applyCallback: ApplyCallback,
        )
    {
        this._fee = <FacilityFee>
        {
            Id                  : EmptyGuid,
            PartOf              : this._facility,
            Type                : feeType,
            Amount              : null,
            ExpectedReceivedDate: null,
            Received            : false,
            AccrualDate         : null
        };
    }

    Update(
        fee          : FacilityFee,
        applyCallback: ApplyCallback,
        )
    {
        //let subgraph = Query(
        //    facility,
        //    Facility._subgraph);

        //this._applyCallback = applyCallback;
        //this._copy = new Map<object, object>();
        //this._facility.next(<facilityAgreements.Facility>Copy(
        //    subgraph,
        //    this._copy,
        //    facility));
        //this.ComputeBookingOffice();
    }

    Apply(): void
    {
        //let before = new Set<ContractualCommitment>();
        //let after = new Set<ContractualCommitment>();
        //if(this._copy)
        //{
        //    let original = new Map<object, object>();
        //    [...this._copy.entries()].forEach(
        //        entry => original.set(
        //            entry[1],
        //            entry[0]));

        //    this.Flatten(
        //        <ContractualCommitment>original.get(this.Facility),
        //        before);

        //    let subgraph = Query(
        //        this.Facility,
        //        Facility._subgraph);

        //    Update(
        //        subgraph,
        //        original,
        //        this.Facility);

        //    this.Flatten(<
        //        ContractualCommitment>original.get(this.Facility),
        //        after);
        //}
        //else
        //    this.Flatten(
        //        this.Facility,
        //        after);

        //[...before]
        //    .filter(commitment => !after.has(commitment))
        //    .forEach(
        //        commitment =>
        //        {
        //            if(commitment.Contract)
        //                commitment.Contract.Confers.splice(
        //                    commitment.Contract.Confers.indexOf(commitment),
        //                    1);

        //            this._deal.Confers.splice(
        //                this._deal.Confers.indexOf(commitment),
        //                1);
        //        });

        //[...after]
        //    .filter(commitment => !before.has(commitment))
        //    .forEach(
        //        commitment =>
        //        {
        //            if(commitment.Contract)
        //                commitment.Contract.Confers.push(commitment);

        //            this._deal.Confers.push(commitment);
        //        });

        //if(this._applyCallback)
        //    this._applyCallback();

        this.Close();
    }

    Cancel(): void
    {
        this.Close();
    }

    Close(): void
    {
        this._fee = null;
    }
}
