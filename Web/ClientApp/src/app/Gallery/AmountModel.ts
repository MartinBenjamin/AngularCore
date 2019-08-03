import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { AmountConversionService } from './AmountConversionService';
import { NumberModel } from './NumberModel';

@Directive(
{
    selector: '[dtAmountModel]'
})
export class AmountModel extends NumberModel
{
    constructor(
        el: ElementRef,
        amountConversionService: AmountConversionService
        )
    {
        super(
            el,
            amountConversionService);
    }

    @Input('dtAmountModel')
    set Model(
        model: string
        )
    {
        this._el.nativeElement.value = model;
        this.Validate();
    }

    @Output('dtAmountModelChange')
    ModelChange = new EventEmitter<string>();

    @HostListener('change')
    onchange(): void
    {
        this.Validate();
        this.ModelChange.emit(this._el.nativeElement.value);
    }
}
