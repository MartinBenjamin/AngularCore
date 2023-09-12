using System;

namespace CommonDomainObjects.Mapping
{
    public class GeographicRegionHierarchyMember: HierarchyMember<
        Guid,
        Locations.GeographicRegionHierarchy,
        Locations.GeographicRegionHierarchyMember,
        Locations.GeographicRegion>
    {
        public GeographicRegionHierarchyMember()
        {
            Schema("Locations");

            Bag(
                geographicRegionHierarchyMember => geographicRegionHierarchyMember.Children,
                bagPropertiesMapper => bagPropertiesMapper.OrderBy("IntervalStart"));
        }
    }
}
