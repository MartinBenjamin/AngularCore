import { Directive, ElementRef, EventEmitter, Inject, Input, Output } from '@angular/core';
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
