import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { EmptyGuid } from '../CommonDomainObjects';
import { DealProvider } from '../DealProvider';
import { Deal, DealRoleIdentifier } from '../Deals';
import { Facility } from '../FacilityAgreements';
import { FacilityProvider } from '../FacilityProvider';
import { LegalEntity } from '../LegalEntities';
import { LegalEntityFinder } from '../LegalEntityFinder';
import { Role } from '../Roles';
import { RolesToken } from '../RoleServiceProvider';
import { PartyInRole } from '../Parties';

@Component(
    {
        selector: 'external-funding',
        templateUrl: './ExternalFunding.html'
    })
export class ExternalFunding implements OnDestroy
{
    private _externalFundingProviderRole: Role;
    private _subscriptions              : Subscription[] = [];
    private _deal                       : Deal;
    private _facility                   : Facility;
    private _externalFunding            : import('../FacilityAgreements').ExternalFunding;
    private _providers                  : LegalEntity[];

    @ViewChild('legalEntityFinder', { static: true })
    private _legalEntityFinder: LegalEntityFinder;

    constructor(
        @Inject(RolesToken)
        roles: Observable<Role[]>,
        dealProvider: DealProvider,
        facilityProvider: FacilityProvider,
        )
    {
        this._subscriptions.push(
            roles.subscribe(roles => this._externalFundingProviderRole = roles.find(role => role.Id == DealRoleIdentifier.ExternalFundingProvider)),
            dealProvider.subscribe(deal => this._deal = deal),
            facilityProvider.subscribe(
                facility =>
                {
                    this._facility = facility;
                    if(!this._facility)
                        this._externalFunding = null;

                    else
                        this._externalFunding = <import('../FacilityAgreements').ExternalFunding>this._facility.Parts.find(part => (<any>part).$type === 'Web.Model.ExternalFunding, Web');

                    this.ComputeProviders();
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

    private ComputeProviders()
    {
        if(!this._externalFunding)
        {
            this._providers = null;
            return;
        }

        this._providers = this._externalFunding.Obligors
            .filter(obligor => obligor.Role.Id === DealRoleIdentifier.ExternalFundingProvider)
            .map(obligor => <LegalEntity>obligor.Organisation);
    }

    get Providers(): LegalEntity[]
    {
        return this._providers;
    }

    AddProvider(): void
    {
        this._legalEntityFinder.Find(
            legalEntity =>
            {
                if(this._providers && this._providers.find(provider => provider.Id === legalEntity.Id))
                {
                    alert(`${legalEntity.Name} is already a ${this._externalFundingProviderRole.Name}.`);
                    return;
                }

                let providerParty = this._deal.Parties.find(
                    party => party.Organisation.Id === legalEntity.Id && party.Role.Id === this._externalFundingProviderRole.Id);

                if(!providerParty)
                    providerParty = <PartyInRole>
                        {
                            Id             : EmptyGuid,
                            AutonomousAgent: legalEntity,
                            Organisation   : legalEntity,
                            Person         : null,
                            Role           : this._externalFundingProviderRole,
                            Period         : null
                        };

                this._externalFunding.Obligors.push(providerParty);
                this.ComputeProviders();
            });
    }

    DeleteProvider(
        provider: LegalEntity
        ): void
    {
        if(!confirm(`Delete ${this._externalFundingProviderRole.Name} ${provider.Name}?`))
            return;

        for(let index = 0; index < this._externalFunding.Obligors.length; ++index)
        {
            let obligor = this._externalFunding.Obligors[index];
            if(obligor.Role.Id === DealRoleIdentifier.ExternalFundingProvider &&
               obligor.Organisation === provider)
            {
                this._externalFunding.Obligors.splice(
                    index,
                    1);
                this.ComputeProviders();
                break;
            }
        }
    }
}
