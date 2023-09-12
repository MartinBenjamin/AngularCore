import { Named, Guid } from './CommonDomainObjects';

export interface Currency extends Named<Guid>
{
    AlphabeticCode: string;
    NumericCode   : number;
    MinorUnit     : number;
}
