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

    protected SetModel(
        model: number | string
        ): void
    {
        let valid = true;
        let input: HTMLInputElement = this._el.nativeElement;

        if(model === null)
            input.value = '';

        else if(typeof model === 'number')
            input.value = this._numberConversionService.Format(model);

        else
        {
            input.value = model.toString();
            valid = false;
        }

        input.classList.toggle(
            'InputError',
            !valid);
    }

    @HostListener('change')
    onchange(): void
    {
        let valid = true;
        let model: number = null;
        let input: HTMLInputElement = this._el.nativeElement;
        const value: string = input.value.replace(/(^ +)|( +$)/g, '');

        if(value != '')
        {
            model = this._numberConversionService.Parse(value);
            if(isNaN(model))
                valid = false;

            else
                input.value = this._numberConversionService.Format(model);
        }

        input.classList.toggle(
            'InputError',
            !valid);

        this.Emit(valid ? model : value);
    }

    abstract Emit(model: number | string): void;
}
