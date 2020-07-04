using System;

namespace Web.Model
{
    public class GeographicRegionHierarchy: Hierarchy<Guid, GeographicRegionHierarchy, GeographicRegionHierarchyMember, GeographicRegion>
    {
        public GeographicRegionHierarchy() : base()
        {
        }
    }

    public class GeographicRegionHierarchyMember: HierarchyMember<Guid, GeographicRegionHierarchy, GeographicRegionHierarchyMember, GeographicRegion>
    {
        public GeographicRegionHierarchyMember() : base()
        {
        }
    }
}
