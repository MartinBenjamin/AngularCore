import { Organisation } from "./Organisations";
import { Country } from "./Iso3166";

export class LegalEntityIdentifier
{
    static readonly Bank = '29e0cadd-db9a-45c3-b9cb-6b47ab669a8f';
}

export interface LegalEntity extends Organisation
{
    Country: Country;
}
