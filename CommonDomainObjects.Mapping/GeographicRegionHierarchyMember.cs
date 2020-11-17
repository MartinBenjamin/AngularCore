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
                manyToOneMapper => manyToOneMapper.Column(columnMapper => columnMapper.SqlType(GeographicRegion.IdSqlType)));

            Bag(
                geographicRegionHierarchyMember => geographicRegionHierarchyMember.Children,
                bagPropertiesMapper => bagPropertiesMapper.OrderBy("IntervalStart"));
        }
    }
}
