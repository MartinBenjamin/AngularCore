import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ClassificationScheme } from '../../ClassificationScheme';
import { ClassificationSchemeServiceToken } from '../../ClassificationSchemeServiceProvider';
import { Group } from '../../Collections/Group';
import { Guid } from '../../CommonDomainObjects';
import { DealProvider } from '../../DealProvider';
import { ClassificationSchemeIdentifier, Deal } from '../../Deals';
import { Store } from '../../EavStore/IEavStore';
import { Fee, FeeType } from '../../Fees';
import { IDomainObjectService } from '../../IDomainObjectService';
import { FeeEditor } from './FeeEditor';

@Component(
    {
        selector: 'fees',
        templateUrl: './Fees.html'
    })
export class Fees implements OnDestroy
{
    private _subscriptions: Subscription[] = [];
    private _deal         : Deal;
    private _fees         : [FeeType, Fee[]][];
    private _feeTypes     : FeeType[];
    private _feeType      : FeeType;

    @ViewChild('editor', { static: true })
    private _editor: FeeEditor;

    constructor(
        dealProvider: DealProvider,
        @Inject(ClassificationSchemeServiceToken)
        classificationSchemeService: IDomainObjectService<Guid, ClassificationScheme>
        )
    {
        this._subscriptions.push(
            dealProvider.subscribe(
                deal =>
                {
                    this._deal = deal;
                    this._feeType  = null;

                    if(this._deal)
                    {

                        const store = Store(this._deal);
                        classificationSchemeService
                            .Get(ClassificationSchemeIdentifier.OtherFeeType)
                            .subscribe(
                                classificationScheme =>
                                    this._feeTypes = classificationScheme
                                        .Classifiers
                                        .map(classificationSchemeClassifier => <FeeType>store.Assert(classificationSchemeClassifier.Classifier))
                                        .sort((a, b) => a.Name.localeCompare(b.Name)))
                    }

                    this.ComputeFees();
                }));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get FeeTypes(): FeeType[]
    {
        return this._feeTypes;
    }

    get FeeType(): FeeType
    {
        return this._feeType;
    }

    set FeeType(
        feeType: FeeType
        )
    {
        this._feeType = feeType;
    }

    get Fees(): [FeeType, Fee[]][]
    {
        return this._fees;
    }

    Add(): void
    {
        this._editor.Create(
            this._feeType,
            () => this.ComputeFees());
    }

    Update(
        fee: Fee
        ): void
    {
        this._editor.Update(
            fee,
            () => this.ComputeFees());
    }

    Delete(
        fee: Fee
        ): void
    {
        this._deal.Commitments.splice(
            this._deal.Commitments.indexOf(fee),
            1);
        this.ComputeFees();
    }

    private ComputeFees(): void
    {
        if(!this._deal)
        {
            this._fees = null;
            return;
        }

        this._fees = [...Group(
            this._deal.Commitments.filter((commitment): commitment is Fee => (<any>commitment).$type == 'Web.Model.Fee, Web'),
            fee => fee.Type,
            fee => fee)].sort((a, b) => a[0].Name.localeCompare(b[0].Name));
    }
}
