import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { EmptyGuid } from '../CommonDomainObjects';
import { DealRoleIdentifier } from '../Deals';
import { Facility } from '../FacilityAgreements';
import { FacilityProvider } from '../FacilityProvider';
import { LegalEntity } from '../LegalEntities';
import { LegalEntityFinder } from '../LegalEntityFinder';
import { Role } from '../Roles';
import { RolesToken } from '../RoleServiceProvider';

@Component(
    {
        selector: 'external-funding',
        templateUrl: './ExternalFunding.html'
    })
export class ExternalFunding implements OnDestroy
{
    private _subscriptions              : Subscription[] = [];
    private _facility                   : Facility;
    private _externalFunding            : import('../FacilityAgreements').ExternalFunding;
    private _externalFundingProviderRole: Role;

    @ViewChild('legalEntityFinder', { static: true })
    private _legalEntityFinder: LegalEntityFinder;

    constructor(
        facilityProvider: FacilityProvider,
        @Inject(RolesToken)
        roles: Observable<Role[]>,
        )
    {
        this._subscriptions.push(
            roles.subscribe(roles => this._externalFundingProviderRole = roles.find(role => role.Id == DealRoleIdentifier.ExternalFundingProvider)),
            facilityProvider.subscribe(
                facility =>
                {
                    this._facility = facility;
                    if(!this._facility)
                        this._externalFunding = null;

                    else
                        this._externalFunding = <import('../FacilityAgreements').ExternalFunding>this._facility.Parts.find(part => (<any>part).$type === 'Web.Model.ExternalFunding, Web');
                }));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get Facility(): Facility
    {
        return this._facility;
    }

    get ExternallyFunded(): boolean
    {
        return this._externalFunding != null;
    }

    set ExternallyFunded(
        externallyFunded: boolean
        )
    {
        if(externallyFunded && !this._externalFunding)
        {
            this._externalFunding = <import('../FacilityAgreements').ExternalFunding>
            {
                Id        : EmptyGuid,
                Obligors  : [],
                PartOf    : this._facility,
                Percentage: null
            };

            (<any>this._externalFunding).$type = 'Web.Model.ExternalFunding, Web';
            this._externalFunding.PartOf.Parts.push(this._externalFunding);
        }
        else if(!externallyFunded && this._externalFunding)
        {
            this._externalFunding.PartOf.Parts.splice(
                this._externalFunding.PartOf.Parts.indexOf(this._externalFunding),
                1);
            this._externalFunding = null;
        }
    }

    get ExternalFunding(): import('../FacilityAgreements').ExternalFunding
    {
        return this._externalFunding;
    }

    AddProvider(): void
    {
        this._legalEntityFinder.Find(
            legalEntity =>
            {
            });
    }

    RemoveProvider(
        provider: LegalEntity
        ): void
    {

    }
}
