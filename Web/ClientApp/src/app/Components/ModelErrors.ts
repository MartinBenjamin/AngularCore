import { Directive, DoCheck, ElementRef, Input } from '@angular/core';

@Directive(
    {
        selector: '[dtModelErrors]'
    })
export class ModelErrors implements DoCheck
{
    private _previousHighlight: number;

    constructor(
        private _el: ElementRef
        )
    {
        this.Model = null;
    }

    private Toggle(
        token: string,
        force: boolean
        ): void
    {
        let classList: DOMTokenList = this._el.nativeElement.classList;
        force ? classList.add(token) : classList.remove(token);
    }

    ngDoCheck()
    {
        this.Toggle(
            'ValidationError',
            this.Model);

        this.Toggle(
            'Highlight',
            this.Model ? this.Model.Highlight : false);

        if(this.Model)
        {
            if(this.Model.Highlight &&
               this.Model.Highlight != this._previousHighlight)
            {
                let event = document.createEvent('CustomEvent');
                event.initEvent(
                    'SelectTab',
                    true,
                    false);

                setTimeout(
                    () => this._el.nativeElement.dispatchEvent(event),
                    0);
            }

            this._previousHighlight = this.Model.Highlight;
        }
    }

    @Input('dtModelErrors')
    Model: any;
}  
