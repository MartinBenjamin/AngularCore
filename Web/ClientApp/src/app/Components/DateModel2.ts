import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { DateConversionService } from './DateConversionService';

@Directive(
{
    selector: '[dtDateModel2]'
})
export class DateModel2
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

    @Input('dtDateModel2')
    set Model(
        model: Date | string
        )
    {
        let value = '';
        let valid = true;

        if(typeof model == 'string')
        {
            value = model;
            valid = false;
        }
        else if(model != null)
        {
            value = this._dateConversionService.Format(model);
            valid = true;
        }

        this._el.nativeElement.value = value;
        this.Toggle(
            'InputError',
            !valid);

    }

    @Output('dtDateModel2Change')
    ModelChange = new EventEmitter<Date | string>();

    @HostListener('change')
    onchange(): void
    {
        let value: string = this._el.nativeElement.value.replace(/(^ +)|( +$)/g, '');
        let valueToEmit: Date | string = null;
        let valid = true;

        if(value != '')
        {
            let date = this._dateConversionService.Parse(value);
            if(date == null)
            {
                valid = false;
                valueToEmit = value;
            }
            else
            {
                this._el.nativeElement.value = this._dateConversionService.Format(date);
                valid = true;
                valueToEmit = date;
            }
        }

        this.Toggle(
            'InputError',
            !valid);

        this.ModelChange.emit(valueToEmit);
    }
}
