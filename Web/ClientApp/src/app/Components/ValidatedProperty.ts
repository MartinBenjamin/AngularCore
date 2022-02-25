import { Directive, ElementRef, Inject, InjectionToken, Input, OnDestroy, Provider } from '@angular/core';
import { Observable, BehaviorSubject, Subject, Subscription } from "rxjs";

export type Errors = Map<object, Map<string, unknown>>;
export type Property = [object, string];

export const ErrorsSubjectToken                 = new InjectionToken<Subject<Errors>>('ErrorsSubjectToken');
export const ErrorsObservableToken              = new InjectionToken<Observable<Errors>>('ErrorsObservableToken');
export const HighlightedPropertySubjectToken    = new InjectionToken<Subject<Property>>('HighlightedPropertySubjectToken');
export const HighlightedPropertyObservableToken = new InjectionToken<Observable<Property>>('HighlightedPropertyObservableToken');

export const ErrorsSubjectProvider: Provider =
{
    provide: ErrorsSubjectToken,
    useFactory: () => new BehaviorSubject<Errors>(null)
};

export const ErrorsObservableProvider: Provider =
{
    provide: ErrorsObservableToken,
    useFactory: (errorsSubject: Subject<Errors>) => errorsSubject.asObservable(),
    deps: [ErrorsSubjectToken]
};

export const HighlightedPropertySubjectProvider: Provider =
{
    provide: HighlightedPropertySubjectToken,
    useFactory: () => new BehaviorSubject<Property>(null)
};

export const HighlightedPropertyObservableProvider: Provider =
{
    provide: HighlightedPropertyObservableToken,
    useFactory: (highlightedPropertySubject: Subject<Property>) => highlightedPropertySubject.asObservable(),
    deps: [HighlightedPropertySubjectToken]
};

@Directive(
    {
        selector: '[dtValidatedProperty]'
    })
export class ValidatedProperty implements OnDestroy
{
    private _errorsServiceSubscription             : Subscription;
    private _highlightedPropertyServiceSubscription: Subscription;
    private _object                                : object;
    private _property                              : string;

    constructor(
        private _el: ElementRef,
        @Inject(ErrorsObservableToken)
        private _errorsService: Observable<Errors>,
        @Inject(HighlightedPropertyObservableToken)
        private _highlightedPropertyService: Observable<Property>
        )
    {
    }

    ngOnDestroy(): void
    {
        this.Unsubscribe();
    }

    @Input('dtValidatedObject')
    set Object(
        object: object
        )
    {
        if(this._object !== object)
            this.Unsubscribe();

        this._object = object;
        this.Subscribe();
    }

    @Input('dtValidatedProperty')
    set Property(
        property: string
        )
    {
        if(this._property !== property)
            this.Unsubscribe();
            
        this._property = property;
        this.Subscribe();
    }

    private Subscribe()
    {
        if(this._object &&
           this._property)
        {
            let htmlElement = <HTMLElement>this._el.nativeElement;
            if(!this._errorsServiceSubscription)
                this._errorsServiceSubscription = this._errorsService.subscribe(
                    errors =>
                    {
                        let objectErrors  : Map<string, unknown> = null;
                        let propertyErrors: unknown = null;

                        if(errors)
                            objectErrors = errors.get(this._object);

                        if(objectErrors)
                            propertyErrors = objectErrors.get(this._property);

                        htmlElement.classList.toggle(
                            'ValidationError',
                            propertyErrors != null);

                        if(propertyErrors)
                        {
                            if(!this._highlightedPropertyServiceSubscription)
                                this._highlightedPropertyServiceSubscription = this._highlightedPropertyService.subscribe(
                                    highlightedProperty =>
                                    {
                                        if(highlightedProperty &&
                                           highlightedProperty[0] === this._object &&
                                           highlightedProperty[1] === this._property)
                                        {
                                            htmlElement.classList.add('Highlight');
                                            let event = document.createEvent('CustomEvent');
                                            event.initEvent(
                                                'SelectTab',
                                                true,
                                                false);

                                            setTimeout(
                                                () => htmlElement.dispatchEvent(event),
                                                0);
                                        }
                                        else
                                            htmlElement.classList.remove('Highlight');
                                    });
                        }
                        else if(this._highlightedPropertyServiceSubscription)
                        {
                            this._highlightedPropertyServiceSubscription.unsubscribe();
                            this._highlightedPropertyServiceSubscription = null;
                        }

                    });
        }
    }

    private Unsubscribe(): void
    {
        if(this._errorsServiceSubscription)
        {
            this._errorsServiceSubscription.unsubscribe();
            this._errorsServiceSubscription = null;
        }

        if(this._highlightedPropertyServiceSubscription)
        {
            this._highlightedPropertyServiceSubscription.unsubscribe();
            this._highlightedPropertyServiceSubscription = null;
        }
    }
}
