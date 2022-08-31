import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { DomainObject, Guid } from '../../CommonDomainObjects';
import { DealProvider } from '../../DealProvider';
import { Deal } from '../../Deals';

@Component(
    {
        selector: 'common',
        templateUrl: './Common.html'
    })
export class Common
{
    constructor(
        private _deal: DealProvider
        )
    {
    }

    get Deal(): Observable<Deal>
    {
        return this._deal;
    }

    CompareById(
        lhs: DomainObject<Guid>,
        rhs: DomainObject<Guid>
        )
    {
        return lhs === rhs || (lhs && rhs && lhs.Id === rhs.Id);
    }
}
