import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive(
    {
        selector: '[dtTextModel]'
    })
export class TextModel
{
    constructor(
        private _el: ElementRef
        )
    {
    }

    @Input('dtTextModel')
    set Model(
        model: string
        )
    {
        this._el.nativeElement.value = model;
    }

    @Output('dtTextModelChange')
    ModelChange = new EventEmitter<string>();

    @HostListener('change')
    onchange(): void
    {
        this.ModelChange.emit(this._el.nativeElement.value);
    }
}