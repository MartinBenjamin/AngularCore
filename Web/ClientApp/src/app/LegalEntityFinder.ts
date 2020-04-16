import { Component, Directive, ElementRef, Inject, Input, OnInit } from '@angular/core';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { merge } from 'rxjs/observable/merge';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { Guid } from './CommonDomainObjects';
import { INamedService, NamedFilters } from './INamedService';
import { LegalEntity } from './LegalEntities';
import { LegalEntityServiceToken } from './LegalEntityServiceProvider';


@Directive(
    {
        selector: 'legal-entity-finder-buttons'
    })
export class LegalEntityButtons
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
                            <td class="RowHeading"></td>
                            <td><input type="text" #nameFragmentInput /></td>
                            <td></td>
                        </tr>
                    </table></td>
            </tr>
            <tr *ngIf="Results">
                <td>
                    <table class="DataGrid LegalEntities">
                        <tr>
                            <th>Legal Entity</th>
                            <th>Country</th>
                        </tr>
                        <tr *ngFor="let legalEntity of Results" class="Hover" style="cursor: pointer;">
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
export class LegalEntityFinder implements OnInit
{
    private _nameFragmentInput: ElementRef;
    private _select           : (legalEntity: LegalEntity) => void;
    private _cancel           : () => void;
    private _reset            = new Subject<string>();
    private _finding          : boolean;
    Results                   : LegalEntity[];

    constructor(
        @Inject(LegalEntityServiceToken)
        private _legalEntityService: INamedService<Guid, LegalEntity, NamedFilters>
        )
    {
    }

    ngOnInit(): void
    {
        merge(
            merge(
                [
                    'keyup',
                    'click'
                ].map(
                    event => fromEvent(
                        this._nameFragmentInput.nativeElement,
                        event)))
                .map(() => (<HTMLInputElement>this._nameFragmentInput.nativeElement).value.toLowerCase()),
            this._reset).pipe(
                distinctUntilChanged(),
                debounceTime(750),
                filter(nameFragment => nameFragment != null))
            .subscribe(nameFragment =>
            {
                this._finding = true;
                this._legalEntityService.Find(
                    {
                        NameFragment: nameFragment,
                        MaxResult   : 20
                    }).subscribe(
                        results =>
                        {
                            this.Results = results;
                            this._finding = false;
                        });
            });
    }

    get Open(): boolean
    {
        return this._select != null;
    }

    get Finding(): boolean
    {
        return this._finding;
    }

    @Input()
    Title: string;

    get NameFragment(): string
    {
        return (<HTMLInputElement>this._nameFragmentInput.nativeElement).value;
    }

    Find(
        select: (legalEntity: LegalEntity) => void,
        cancel: () => void
        ): void
    {
        this._select = select;
        this._cancel = cancel;
    }

    Select(
        legalEntity: LegalEntity
        ): void
    {
        this._select(legalEntity);
        this.Close();
    }

    Cancel(): void
    {
        if(this._cancel)
            this._cancel();

        this.Close();
    }

    Close(): void
    {
        this._nameFragmentInput.nativeElement.value = '';
        this.Results = null;
        this._select = null;
        this._cancel = null;
        this._reset.next(null);
    }
}
