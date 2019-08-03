import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { NumberModel } from './NumberModel';
import { PercentageConversionService } from './PercentageConversionService';

@Directive(
{
    selector: '[dtPercentageModel]'
})
export class PercentageModel extends NumberModel
{
    constructor(
        el: ElementRef,
        percentageConversionService: PercentageConversionService
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