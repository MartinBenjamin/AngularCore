import { Component, Directive, Inject } from '@angular/core';
import { Guid } from './CommonDomainObjects';
import { INamedService, NamedFilters } from './INamedService';
import { LegalEntity } from './LegalEntities';
import { LegalEntityServiceToken } from './LegalEntityServiceProvider';
import { NamedFinder } from './NamedFinder';


@Directive(
    {
        selector: 'legal-entity-finder-buttons'
    })
export class LegalEntityFinderButtons
{
}

@Component(
    {
        selector: 'legal-entity-finder',
        template: `<dt-dialog
    [Title]="Title"
    [Open]="Open">
    <dt-dialog-body
        ><table class="GridLayout NamedFinder">
            <tr>
                <td style="padding: 2px"
                    ><table class="GridLayout">
                        <tr>
                            <td class="RowHeading">Name:</td>
                            <td><input type="text" #nameFragmentInput /></td>
                            <td></td>
                        </tr>
                    </table></td>
            </tr>
            <tr *ngIf="Results">
                <td>
                    <table class="DataGrid LegalEntities" style="empty-cells: show;">
                        <tr>
                            <th>Legal Entity</th>
                            <th>Country</th>
                        </tr>
                        <tr *ngFor="let legalEntity of Results" class="Hover"
                            (click)="Select(legalEntity)"
                            style="cursor: pointer;">
                            <td>{{legalEntity.Name}}</td>
                            <td>{{legalEntity?.Country.Name}}</td>
                        </tr>
                        <tr [hidden]="Results && Results.length">
                            <td colspan="3" style="text-align: center;"> No Legal Entities Found.</td>
                        </tr>
                    </table>
                </td>
            </tr>
      </table>
    </dt-dialog-body>
    <dt-dialog-buttons><ng-content select="legal-entity-finder-buttons"></ng-content
        ><input type="button" value="Cancel" (click)="Cancel()" class="Button" /></dt-dialog-buttons>
</dt-dialog>`
    })
export class LegalEntityFinder extends NamedFinder<Guid, LegalEntity, NamedFilters>
{
    constructor(
        @Inject(LegalEntityServiceToken)
        legalEntityService: INamedService<Guid, LegalEntity, NamedFilters>
        )
    {
        super(legalEntityService);
    }
}
