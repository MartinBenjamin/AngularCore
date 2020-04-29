import { Directive, ElementRef, EventEmitter, HostListener, Inject, Input, Output } from '@angular/core';
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
        model: string
        )
    {
        this._el.nativeElement.value = model;
        this.Validate();
    }

    @Output('dtPercentageModelChange')
    ModelChange = new EventEmitter<string>();

    @HostListener('change')
    onchange(): void
    {
        this.Validate();
        this.ModelChange.emit(this._el.nativeElement.value);
    }
}
