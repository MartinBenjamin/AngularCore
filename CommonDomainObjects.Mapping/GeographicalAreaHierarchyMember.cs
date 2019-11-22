using System;

namespace CommonDomainObjects.Mapping
{
    public class GeographicalAreaHierarchyMember: HierarchyMember<
        Guid,
        Geophysical.GeographicalAreaHierarchy,
        Geophysical.GeographicalAreaHierarchyMember,
        Geophysical.GeographicalArea>
    {
        public GeographicalAreaHierarchyMember()
        {
            ManyToOne(
                geographicalAreaHierarchyMember => geographicalAreaHierarchyMember.Member,
                manyToOneMapping => manyToOneMapping.Column(columnMapping => columnMapping.SqlType(GeographicalArea.IdSqlType)));
        }
    }
}
