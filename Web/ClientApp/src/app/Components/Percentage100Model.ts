import { Directive, ElementRef, EventEmitter, HostListener, Inject, Input, Output } from '@angular/core';
import { IConversionService } from './IConversionService';
import { NumberModel } from './NumberModel';
import { Percentage100ConversionServiceToken } from './Percentage100InputDefinition';

@Directive(
    {
        selector: '[dtPercentage100Model]'
    })
export class Percentage100Model extends NumberModel
{
    constructor(
        el: ElementRef,
        @Inject(Percentage100ConversionServiceToken)
        percentageConversionService: IConversionService<number>
        )
    {
        super(
            el,
            percentageConversionService);
    }

    @Input('dtPercentage100Model')
    set Model(
        model: string | number
        )
    {
        this.SetModel(model);
    }

    @Output('dtPercentage100ModelChange')
    ModelChange = new EventEmitter<number | string>();

    Emit(model: number | string): void
    {
        this.ModelChange.emit(model);
    }
}
