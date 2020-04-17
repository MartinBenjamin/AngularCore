import { ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { merge } from 'rxjs/observable/merge';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { Named } from './CommonDomainObjects';
import { INamedService, NamedFilters } from './INamedService';

export abstract class NamedFinder<TId, TNamed extends Named<TId>, TNamedFilters extends NamedFilters> implements OnInit
{
    @ViewChild('nameFragmentInput')
    private   _nameFragmentInput: ElementRef;
    protected _filters = <TNamedFilters>{
        NameFragment: '',
        MaxResults  : 20
        };
    private   _select           : (named: TNamed) => void;
    private   _cancel           : () => void;
    private   _reset            = new Subject<string>();
    private   _finding          : boolean;
    Results                     : TNamed[];

    protected constructor(
        private _namedService: INamedService<TId, TNamed, TNamedFilters>
        )
    {
    }

    ngOnInit(): void
    {
        let component = this;
        merge(
            merge(
                fromEvent(
                    this._nameFragmentInput.nativeElement,
                    'keyup'),
                fromEvent(
                    this._nameFragmentInput.nativeElement,
                    'click'))
                .map(() => (<HTMLInputElement>component._nameFragmentInput.nativeElement).value.toLowerCase()),
            this._reset).pipe(
                distinctUntilChanged(),
                debounceTime(750),
                filter(nameFragment => nameFragment != null))
            .subscribe(nameFragment =>
            {
                this._filters.NameFragment = nameFragment;
                this.ExecuteFind();
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

    Find(
        select: (named: TNamed) => void,
        cancel?: () => void
        ): void
    {
        this._select = select;
        this._cancel = cancel;
    }

    Select(
        named: TNamed
        ): void
    {
        this._select(named);
        this.Close();
    }

    Cancel(): void
    {
        if(this._cancel)
            this._cancel();

        this.Close();
    }

    protected Close(): void
    {
        this._nameFragmentInput.nativeElement.value = '';
        this.Results = null;
        this._select = null;
        this._cancel = null;
        this._reset.next(null);
    }

    protected ExecuteFind()
    {
        this._finding = true;
        this._namedService.Find(
            this._filters
            ).subscribe(
                results =>
                {
                    this.Results = results;
                    this._finding = false;
                });
    }
}
