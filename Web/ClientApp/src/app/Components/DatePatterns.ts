import { InjectionToken } from '@angular/core';
import { Patterns } from './Patterns';

export let DatePatternsToken = new InjectionToken<Patterns>("DatePatterns");
export let DatePatterns: Patterns =
    {
        Input:
        [
            'ddMMyy',
            'ddMMyyyy',
            'd/M/yy',
            'd/M/yyyy',
            'd MMM yy',
            'd MMM yyyy',
            'd-MMM-yy',
            'd-MMM-yyyy',
            'd MMMM yy',
            'd MMMM yyyy',
            'd-MMMM-yy',
            'd-MMMM-yyyy',
            'MMM yy',
            'MMM yyyy',
            'MMM-yy',
            'MMM-yyyy'
        ],
        Output: 'dd-MMM-yyyy'
    };
