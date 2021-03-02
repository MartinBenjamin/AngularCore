import { PipeTransform } from '@angular/core';
import { IConversionService } from './IConversionService';

export abstract class NumberPipe implements PipeTransform
{
    constructor(
        private _conversionService: IConversionService<number>
        )
    {
    }

    transform(
        number: number
        ): string
    {
        if(typeof number != 'number' ||
           number == null ||
           isNaN(number) ||
           !isFinite(number))
            return '';

        return this._conversionService.Format(number);
    }
} 
