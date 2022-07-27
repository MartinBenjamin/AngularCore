import { Directive, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, Observable, Subject, timer } from 'rxjs';
import { debounce, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { Named } from './CommonDomainObjects';
import { INamedService, NamedFilters } from './INamedService';

@Directive()
export abstract class NamedFinder<TId, TNamed extends Named<TId>, TNamedFilters extends NamedFilters> implements OnInit, OnDestroy
{
    @ViewChild('nameFragmentInput', { static: true })
    private   _nameFragmentInput: ElementRef;
    protected _filters = <TNamedFilters>{
        NameFragment: '',
        MaxResults  : 20
        };
    private   _select  : (named: TNamed) => void;
    private   _cancel  : () => void;
    private   _reset   = new Subject<string>();
    private   _finding = new BehaviorSubject<boolean>(false);
    private   _results : Observable<TNamed[]>;

    protected constructor(
        private _namedService: INamedService<TId, TNamed, TNamedFilters>
        )
    {
    }

    ngOnInit(): void
    {
        const empty = new BehaviorSubject<TNamed[]>([]).asObservable();

        this._results = merge(
            merge(
                fromEvent(
                    this._nameFragmentInput.nativeElement,
                    'keyup'),
                fromEvent(
                    this._nameFragmentInput.nativeElement,
                    'click')).pipe(map(() => (<HTMLInputElement>this._nameFragmentInput.nativeElement).value)),
            this._reset).pipe(
                distinctUntilChanged(),
                debounce(nameFragment => timer(nameFragment == null ? 0 : 750)),
                switchMap(nameFragment =>
                {
                    if(nameFragment === null)
                        return empty;

                    this._finding.next(true);
                    return this._namedService.Find(
                        <TNamedFilters>{
                            NameFragment: nameFragment,
                            MaxResults  : 20
                        });
                }),
                tap(() => this._finding.next(false)));
    }

    ngOnDestroy(): void
    {
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
        this._finding.next(false);
        this._select = null;
        this._cancel = null;
        this._reset.next(null);
    }
}
