import { ElementRef } from '@angular/core';
import { IConversionService } from './IConversionService';

export abstract class NumberModel
{
    constructor(
        protected _el: ElementRef,
        protected _numberConversionService: IConversionService<number>
        )
    {
    }

    private Toggle(
        token: string,
        force: boolean
        ): void
    {
        let classList: DOMTokenList = this._el.nativeElement.classList;
        force ? classList.add(token) : classList.remove(token);
    }

    protected Validate(): void
    {
        let valid: boolean = true;
        let value: string = this._el.nativeElement.value.replace(/(^ +)|( +$)/g, '');

        if(value != '')
        {
            let number = this._numberConversionService.Parse(value);
            if(isNaN(number))
                valid = false;

            else
                this._el.nativeElement.value = this._numberConversionService.Format(number);
        }

        this.Toggle(
            'InputError',
            !valid);
    }
}