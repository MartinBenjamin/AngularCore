import { Directive, ElementRef, EventEmitter, Inject, Input, Output } from '@angular/core';
import { IConversionService } from './IConversionService';
import { NumberModel } from './NumberModel';
import { YearConversionServiceToken } from './YearInputDefinition';

@Directive(
    {
        selector: '[dtYearModel]'
    })
export class YearModel extends NumberModel
{
    constructor(
        el: ElementRef,
        @Inject(YearConversionServiceToken)
        yearConversionService: IConversionService<number>
        )
    {
        super(
            el,
            yearConversionService);
    }

    @Input('dtYearModel')
    set Model(
        model: string | number
        )
    {
        this.SetModel(model);
    }

    @Output('dtYearModelChange')
    ModelChange = new EventEmitter<number | string>();

    Emit(
        model: number | string
        ): void
    {
        this.ModelChange.emit(model);
    }
}
