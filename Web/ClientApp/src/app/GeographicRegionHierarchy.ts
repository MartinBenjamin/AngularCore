import { Hierarchy, HierarchyMember } from "./Hierarchy";
import { Guid } from "./CommonDomainObjects";
import { GeographicRegion } from "./Locations";

export interface GeographicRegionHierarchy extends Hierarchy<
    Guid,
    GeographicRegionHierarchy,
    GeographicRegionHierarchyMember,
    GeographicRegion>
{
}

export interface GeographicRegionHierarchyMember extends HierarchyMember<
    Guid,
    GeographicRegionHierarchy,
    GeographicRegionHierarchyMember,
    GeographicRegion>
{
}
