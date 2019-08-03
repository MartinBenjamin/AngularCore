import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { NumberModel } from './NumberModel';
import { Percentage100ConversionService } from './Percentage100ConversionService';

@Directive(
    {
        selector: '[dtPercentage100Model]'
    })
export class Percentage100Model extends NumberModel
{
    constructor(
        el: ElementRef,
        percentageConversionService: Percentage100ConversionService
        )
    {
        super(
            el,
            percentageConversionService);
    }

    @Input('dtPercentage100Model')
    set Model(
        model: string
        )
    {
        this._el.nativeElement.value = model;
        this.Validate();
    }

    @Output('dtPercentage100ModelChange')
    ModelChange = new EventEmitter<string>();

    @HostListener('change')
    onchange(): void
    {
        this.Validate();
        this.ModelChange.emit(this._el.nativeElement.value);
    }
}