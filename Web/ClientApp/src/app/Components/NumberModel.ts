import { ElementRef, HostListener } from '@angular/core';
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

    SetModel(
        model: number | string
        ): void
    {
        let valid = true;

        if(model == null)
            this._el.nativeElement.value = '';

        else if(typeof model == 'number')
            this._el.nativeElement.value = this._numberConversionService.Format(model);

        else
        {
            this._el.nativeElement.value = model;
            valid = false;
        }

        this.Toggle(
            'InputError',
            !valid);
    }

    @HostListener('change')
    onchange(): void
    {
        let valid = true;
        const value: string = this._el.nativeElement.value.replace(/(^ +)|( +$)/g, '');
        let model: number = null;

        if(value != '')
        {
            model = this._numberConversionService.Parse(value);
            if(isNaN(model))
                valid = false;

            else
                this._el.nativeElement.value = this._numberConversionService.Format(model);
        }

        this.Toggle(
            'InputError',
            !valid);

        this.Emit(valid ? model : value);
    }

    abstract Emit(model: number | string): void;
}
