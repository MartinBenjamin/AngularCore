import { ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, Observable, Subject, Subscription, timer } from 'rxjs';
import { debounce, distinctUntilChanged, filter, map } from 'rxjs/operators';
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
    private   _finding          = new BehaviorSubject<boolean>(false);
    private   _results          = new BehaviorSubject<TNamed[]>(null);

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
                    'click')).pipe(map(() => (<HTMLInputElement>component._nameFragmentInput.nativeElement).value.toLowerCase())),
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

    get Results(): Observable<TNamed[]>
    {
        return this._results;
    }

    get Finding(): Observable<boolean>
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
        this._results.next(null);
        this._finding.next(false);
        this._select = null;
        this._cancel = null;
        this._reset.next(null);
    }

    protected ExecuteFind()
    {
        this._finding.next(true);
        this._namedService.Find(
            this._filters
            ).subscribe(
                results =>
                {
                    this._results.next(results);
                    this._finding.next(false);
                });
    }
}
