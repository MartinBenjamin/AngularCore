import { Directive, ElementRef, EventEmitter, HostListener, Inject, Input, Output } from '@angular/core';
import { AmountConversionServiceToken } from './AmountInputDefinition';
import { numberSymbols } from "./Cldr";
import { IConversionService } from './IConversionService';
import { NumberModel } from './NumberModel';

@Directive(
{
    selector: '[dtAmountModel]'
})
export class AmountModel extends NumberModel
{
    private static _groupRegex = new RegExp(numberSymbols.group, 'g');

    constructor(
        el: ElementRef,
        @Inject(AmountConversionServiceToken)
        amountConversionService: IConversionService<number>
        )
    {
        super(
            el,
            amountConversionService);
    }

    @HostListener('focus')
    onfocus(): void
    {
        let input = <HTMLInputElement>this._el.nativeElement;
        input.value = input.value.replace(
            AmountModel._groupRegex,
            '');
    }

    @HostListener('focusout')
    onfocusout(): void
    {
        this.onchange();
    }

    @Input('dtAmountModel')
    set Model(
        model: string | number
        )
    {
        this.SetModel(model);
    }

    @Output('dtAmountModelChange')
    ModelChange = new EventEmitter<number | string>();

    Emit(model: number | string): void
    {
        this.ModelChange.emit(model);
    }
}
