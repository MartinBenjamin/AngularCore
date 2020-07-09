import { Named, Guid } from "./CommonDomainObjects";

export interface GeographicRegion extends Named<Guid>
{
    Type: GeographicRegionType
}

export interface GeographicSubregion extends GeographicRegion
{
}

export enum GeographicRegionType
{
    Iso3166_1Country,
    Iso3166_2Subdivision,
    UnsdM49Global,
    UnsdM49Region,
    UnsdM49SubRegion,
    UnsdM49IntermediateRegion
}
