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
            ManyToOne(
                geographicRegionHierarchyMember => geographicRegionHierarchyMember.Member,
                manyToOneMapping => manyToOneMapping.Column(columnMapping => columnMapping.SqlType(GeographicRegion.IdSqlType)));
        }
    }
}
