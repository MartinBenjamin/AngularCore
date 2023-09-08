using System;

namespace CommonDomainObjects.Mapping._1
{
    public class GeographicRegionHierarchyMember: HierarchyMember<
        Guid,
        Locations._1.GeographicRegionHierarchy,
        Locations._1.GeographicRegionHierarchyMember,
        Locations._1.GeographicRegion>
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
