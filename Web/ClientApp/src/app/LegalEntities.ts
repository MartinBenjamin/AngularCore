import { Organisation } from "./Organisations";
import { Country } from "./Iso3166";

export interface LegalEntity extends Organisation
{
    Country: Country;
}
