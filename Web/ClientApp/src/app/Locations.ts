import { Named, Guid } from "./CommonDomainObjects";

export interface GeographicRegion extends Named<Guid>
{
}

export interface GeographicSubregion extends GeographicRegion
{
}
