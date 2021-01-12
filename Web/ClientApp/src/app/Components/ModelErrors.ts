import { Directive, ElementRef, Inject, InjectionToken, Input, OnDestroy, Provider } from '@angular/core';
import { Observable, Subject, Subscription } from "rxjs";

export const HighlighterServiceToken = new InjectionToken<Subject<object>>('HighlighterServiceToken');
export const HighlightedServiceToken = new InjectionToken<Observable<object>>('HighlightedServiceToken');

export const HighlighterServiceProvider: Provider =
{
    provide: HighlighterServiceToken,
    useValue: new Subject<object>()
}

export const HighlightedServiceProvider: Provider =
{
    provide: HighlightedServiceToken,
    useFactory: (highlighterService: Subject<object>) => highlighterService,
    deps: [HighlighterServiceToken]
};

@Directive(
    {
        selector: '[dtModelErrors]'
    })
export class ModelErrors implements OnDestroy
{
    private _errors      : object       = null;
    private _subscription: Subscription = null;

    constructor(
        private _el: ElementRef,
        @Inject(HighlightedServiceToken)
        private _highlightedService: Observable<object>
        )
    {
    }

    ngOnDestroy(): void
    {
        if(this._subscription)
            this._subscription.unsubscribe();
    }

    @Input('dtModelErrors')
    set Errors(
        errors: object
        )
    {
        this._errors = errors ? errors : null;

        let element = <HTMLElement>this._el.nativeElement;

        element.classList.toggle(
            'ValidationError',
            this._errors != null);

        if(this._errors !== null && this._subscription === null)
            this._subscription = this._highlightedService.subscribe(
                highlightedErrors =>
                {
                    if(highlightedErrors === this._errors)
                    {
                        element.classList.add('Highlight');
                        let event = document.createEvent('CustomEvent');
                        event.initEvent(
                            'SelectTab',
                            true,
                            false);

                        setTimeout(
                            () => this._el.nativeElement.dispatchEvent(event),
                            0);
                    }
                    else
                        element.classList.remove('Highlight');
                });
        else if(this._errors === null && this._subscription !== null)
        {
            element.classList.remove('Highlight');
            this._subscription.unsubscribe();
            this._subscription = null;
        }
    }
}  
