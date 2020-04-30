import { Directive, ElementRef, EventEmitter, Inject, Input, Output } from '@angular/core';
import { IConversionService } from './IConversionService';
import { NumberModel } from './NumberModel';
import { PercentageConversionServiceToken } from './PercentageInputDefinition';

@Directive(
{
    selector: '[dtPercentageModel]'
})
export class PercentageModel extends NumberModel
{
    constructor(
        el: ElementRef,
        @Inject(PercentageConversionServiceToken)
        percentageConversionService: IConversionService<number>
        )
    {
        super(
            el,
            percentageConversionService);
    }

    @Input('dtPercentageModel')
    set Model(
        model: string | number
        )
    {
        this.SetModel(model);
    }

    @Output('dtPercentageModelChange')
    ModelChange = new EventEmitter<string | number>();

    Emit(model: number | string): void
    {
        this.ModelChange.emit(model);
    }
}
