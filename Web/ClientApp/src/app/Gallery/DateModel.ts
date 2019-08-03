import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { DateConversionService } from './DateConversionService';

@Directive(
{
    selector: '[dtDateModel]'
})
export class DateModel
{
    constructor(
        private _el: ElementRef,
        private _dateConversionService: DateConversionService
        )
    {
    }

    private Toggle(
        token: string,
        force: boolean
        ): void
    {
        let classList: DOMTokenList  = this._el.nativeElement.classList;
        force ? classList.add(token) : classList.remove(token);
    }

    private Validate(): void
    {
        let valid: boolean = true;
        let value: string = this._el.nativeElement.value.replace(/(^ +)|( +$)/g, '');

        if(value != '')
        {
            let date = this._dateConversionService.Parse(value);
            if(date == null)
                valid = false;

            else
                this._el.nativeElement.value = this._dateConversionService.Format(date);
        }

        this.Toggle(
            'InputError',
            !valid);
    }

    @Input('dtDateModel')
    set Model(
        model: string
        )
    {
        this._el.nativeElement.value = model;
        this.Validate();
    }

    @Output('dtDateModelChange')
    ModelChange = new EventEmitter<string>();

    @HostListener('change')
    onchange(): void
    {
        this.Validate();
        this.ModelChange.emit(this._el.nativeElement.value);
    }
}