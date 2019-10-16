import { Named } from './CommonDomainObjects';

export class Currency extends Named<string>
{
    NumericCode: Number;
    MinorUnit: Number;
}
