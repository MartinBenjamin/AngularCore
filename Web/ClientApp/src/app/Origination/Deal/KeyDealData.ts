import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DomainObject, Guid } from '../../CommonDomainObjects';
import { CurrenciesToken } from '../../CurrencyServiceProvider';
import { DealProvider } from '../../DealProvider';
import { Deal } from '../../Deals';
import { Store } from '../../EavStore/IEavStore';
import { Currency } from '../../Iso4217';
import { deals } from '../../Ontologies/Deals';
import { ObservableGenerator } from '../../Ontology/ObservableGenerator';

@Component(
    {
        templateUrl: './KeyDealData.html',
        encapsulation: ViewEncapsulation.None
    })
export class KeyDealData
{
    private _restricted: Observable<boolean>;

    constructor(
        @Inject(CurrenciesToken)
        private _currencies: Observable<Currency[]>,
        private _deal      : DealProvider
        )
    {
        this._restricted = (<Observable<Deal>>this._deal).pipe(switchMap(
            deal =>
            {
                if(!deal)
                    return new BehaviorSubject<boolean>(false);

                const store = Store(deal);

                const interpreter = new ObservableGenerator(
                    deals,
                    store);

                return deals.Restricted.Select(interpreter).pipe(map(restricted => restricted.has(deal)));
            }));
    }

    get Currencies(): Observable<Currency[]>
    {
        return this._currencies;
    }

    get Deal(): Observable<Deal>
    {
        return this._deal;
    }

    get Restricted(): Observable<boolean>
    {
        return this._restricted;
    }

    CompareById(
        lhs: DomainObject<Guid>,
        rhs: DomainObject<Guid>
        )
    {
        return lhs === rhs || (lhs && rhs && lhs.Id === rhs.Id);
    }
}
