import { Component, Inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DomainObject, Guid } from '../CommonDomainObjects';
import { DealProvider } from '../DealProvider';
import { Deal, DealLifeCycleIdentifier, DealLifeCyclePhaseIdentifier } from '../Deals';
import { DealLifeCycleServiceToken, IDealLifeCycleService } from '../IDealLifeCycleService';
import { LifeCycleStage } from '../LifeCycles';

@Component(
    {
        selector: 'common',
        templateUrl: './Common.html'
    })
export class Common implements OnDestroy
{
    private _subscriptions  : Subscription[] = [];
    private _deal           : Deal;
    private _lifeCycleStages: LifeCycleStage[];

    constructor(
        @Inject(DealLifeCycleServiceToken)
        dealLifeCycleService: IDealLifeCycleService,
        dealProvider        : DealProvider
        )
    {
        this._subscriptions.push(
            dealProvider.subscribe(
                deal =>
                {
                    if(!deal)
                    {
                        this._deal            = null;
                        this._lifeCycleStages = null;
                    }
                    else
                    {
                        this._deal = deal[0];

                        dealLifeCycleService.GetStages(
                            DealLifeCycleIdentifier.Debt,
                            DealLifeCyclePhaseIdentifier.Origination
                            ).subscribe(lifeCycleStages => this._lifeCycleStages = lifeCycleStages);
                    }
                }));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get Deal(): Deal
    {
        return this._deal;
    }

    get LifeCycleStages(): LifeCycleStage[]
    {
        return this._lifeCycleStages;
    }

    CompareById(
        lhs: DomainObject<Guid>,
        rhs: DomainObject<Guid>
    )
    {
        return lhs === rhs || (lhs && rhs && lhs.Id === rhs.Id);
    }
}