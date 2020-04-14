import { GeographicRegion, GeographicSubregion } from "./Locations";

export interface Country extends GeographicRegion
{
    Alpha3Code : string;
    Alpha4Code : string;
    NumericCode: string;
    ShortName  : number;  
    Alpha2Code : string;
}

export interface Subdivision extends GeographicSubregion
{
    Code             : string;
    Country          : Country;
    ParentSubdivision: Subdivision;
    Category         : string; 
}
