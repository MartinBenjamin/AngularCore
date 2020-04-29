import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, Inject } from '@angular/core';
import { AmountConversionServiceToken } from './AmountInputDefinition';
import { IConversionService } from './IConversionService';
import { NumberModel } from './NumberModel';

@Directive(
{
    selector: '[dtAmountModel]'
})
export class AmountModel extends NumberModel
{
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
