import { ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { merge } from 'rxjs/observable/merge';
import { timer } from 'rxjs/observable/timer';
import { debounce, distinctUntilChanged, filter } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { Named } from './CommonDomainObjects';
import { INamedService, NamedFilters } from './INamedService';

export abstract class NamedFinder<TId, TNamed extends Named<TId>, TNamedFilters extends NamedFilters> implements OnInit, OnDestroy
{
    @ViewChild('nameFragmentInput')
    private   _nameFragmentInput: ElementRef;
    private   _subscription     : Subscription;
    protected _filters = <TNamedFilters>{
        NameFragment: '',
        MaxResults  : 20
        };
    private   _select           : (named: TNamed) => void;
    private   _cancel           : () => void;
    private   _reset            = new Subject<string>();
    Finding                     = new BehaviorSubject<boolean>(false);
    Results                     = new BehaviorSubject<TNamed[]>(null);

    protected constructor(
        private _namedService: INamedService<TId, TNamed, TNamedFilters>
        )
    {
    }

    ngOnInit(): void
    {
        let component = this;
        this._subscription = merge(
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
                debounce(nameFragment => timer(nameFragment == null ? 0 : 750)),
                filter(nameFragment => nameFragment != null))
            .subscribe(nameFragment =>
            {
                this._filters.NameFragment = nameFragment;
                this.ExecuteFind();
            });
    }

    ngOnDestroy(): void
    {
        this._subscription.unsubscribe();
    }

    get Open(): boolean
    {
        return this._select != null;
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
        this.Results.next(null);
        this._select = null;
        this._cancel = null;
        this._reset.next(null);
    }

    protected ExecuteFind()
    {
        this.Finding.next(true);
        this._namedService.Find(
            this._filters
            ).subscribe(
                results =>
                {
                    this.Results.next(results);
                    this.Finding.next(false);
                });
    }
}
