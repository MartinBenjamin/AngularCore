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

    @Input('dtDateModel')
    set Model(
        model: Date | string
        )
    {
        let valid = true;
        let input: HTMLInputElement = this._el.nativeElement;

        if(typeof model === 'undefined' || model === null)
            input.value = '';

        else if(model instanceof Date)
            input.value = this._dateConversionService.Format(model);

        else
        {
            input.value = model.toString();
            valid = false;
        }

        input.classList.toggle(
            'InputError',
            !valid);

    }

    @Output('dtDateModelChange')
    ModelChange = new EventEmitter<Date | string>();

    @HostListener('change')
    onchange(): void
    {
        let valid = true;
        let date: Date = null;
        let input: HTMLInputElement = this._el.nativeElement;
        const value: string = input.value.replace(/(^ +)|( +$)/g, '');

        if(value != '')
        {
            date = this._dateConversionService.Parse(value);
            if(date == null)
                valid = false;

            else
                input.value = this._dateConversionService.Format(date);
        }

        input.classList.toggle(
            'InputError',
            !valid);

        this.ModelChange.emit(valid ? date : value);
    }
}
