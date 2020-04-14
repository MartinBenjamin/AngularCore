import { Named } from './CommonDomainObjects';

export interface Currency extends Named<string>
{
    NumericCode: Number;
    MinorUnit  : Number;
}
