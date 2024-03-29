import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { DealProvider } from '../../DealProvider';
import { Deal, DealRoleIdentifier } from '../../Deals';
import { Store } from '../../EavStore/IEavStore';
import { Facility } from '../../FacilityAgreements';
import { FacilityProvider } from '../../FacilityProvider';
import { LegalEntity } from '../../LegalEntities';
import { LegalEntityFinder } from '../../LegalEntityFinder';
import { PartyInRole } from '../../Parties';
import { Role } from '../../Roles';
import { RolesToken } from '../../RoleServiceProvider';

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
    private _externalFunding            : import('../../FacilityAgreements').ExternalFunding;
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
                        this._externalFunding = <import('../../FacilityAgreements').ExternalFunding>this._facility.Parts.find(part => (<any>part).$type === 'Web.Model.ExternalFunding, Web');

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
        const store = Store(this._deal);
        store.SuspendPublish();
        if(externallyFunded && !this._externalFunding)
        {
            this._externalFunding = <import('../../FacilityAgreements').ExternalFunding>store.Assert(
            {
                MeasurementUnit: 0.01,
                Obligors       : [],
                PartOf         : this._facility,
                $type          : 'Web.Model.ExternalFunding, Web'
            });

            this._externalFunding.PartOf.Parts.push(this._externalFunding);
        }
        else if(!externallyFunded && this._externalFunding)
        {
            this._externalFunding.PartOf.Parts.splice(
                this._externalFunding.PartOf.Parts.indexOf(this._externalFunding),
                1);
            store.DeleteEntity(this._externalFunding);
            this._externalFunding = null;
        }
        store.UnsuspendPublish();
    }

    get ExternalFunding(): import('../../FacilityAgreements').ExternalFunding
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
            .map(obligor => <LegalEntity>obligor.Organisation)
            .sort((a, b) => a.Name.localeCompare(b.Name));
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

                const store = Store(this._deal);
                store.SuspendPublish();
                if(!providerParty)
                    providerParty = <PartyInRole>store.Assert(
                        {
                            //AutonomousAgent: legalEntity,
                            Organisation   : legalEntity,
                            Role           : this._externalFundingProviderRole,
                        });

                this._externalFunding.Obligors.push(providerParty);
                store.UnsuspendPublish();
                this.ComputeProviders();
            });
    }

    DeleteProvider(
        provider: LegalEntity
        ): void
    {
        if(!confirm(`Delete ${this._externalFundingProviderRole.Name} ${provider.Name}?`))
            return;

        const store = Store(this._deal);
        store.SuspendPublish();
        for(let index = 0; index < this._externalFunding.Obligors.length; ++index)
        {
            let obligor = this._externalFunding.Obligors[index];
            if(obligor.Role.Id === DealRoleIdentifier.ExternalFundingProvider &&
               obligor.Organisation === provider)
            {
                this._externalFunding.Obligors.splice(
                    index,
                    1);
                store.DeleteEntity(obligor);
                break;
            }
        }
        store.UnsuspendPublish();
        this.ComputeProviders();
    }
}
