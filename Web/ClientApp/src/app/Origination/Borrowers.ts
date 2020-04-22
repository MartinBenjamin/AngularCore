import { Component, ViewChild, Inject } from '@angular/core';
import { LegalEntityFinder } from '../LegalEntityFinder';
import { Role } from '../Roles';
import { RolesToken } from '../RoleServiceProvider';
import { Observable } from 'rxjs';
import { DealRoleIdentifier } from '../Deals';

@Component(
    {
        selector: 'borrowers',
        templateUrl: './Borrowers.html'
    })
export class Borrowers
{
    private _borrowerRole: Role;

    @ViewChild('legalEntityFinder')
    private _legalEntityFinder: LegalEntityFinder;

    constructor(
        @Inject(RolesToken)
        private _roles: Observable<Role[]>
        )
    {
        _roles.subscribe(
            roles =>
            {
                this._borrowerRole = roles.find(role => role.Id == DealRoleIdentifier.Borrower);
            });
    }

    get Initialising(): boolean
    {
        return this._borrowerRole != null;
    }

    Add(): void
    {
        this._legalEntityFinder.Find(() => { });
    }
}
