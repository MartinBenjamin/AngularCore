using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class GeographicalAreaHierarchyMember: ClassMapping<CommonDomainObjects.GeographicalAreaHierarchyMember>
    {
        public GeographicalAreaHierarchyMember()
        {
            ManyToOne(
                geographicalAreaHierarchyMember => geographicalAreaHierarchyMember.Member,
                manyToOneMapping => manyToOneMapping.Column(columnMapping => columnMapping.SqlType(GeographicalArea.IdSqlType)));

            ManyToOne(
                geographicalAreaHierarchyMember => geographicalAreaHierarchyMember.Parent,
                manyToOneMapper => manyToOneMapper.ForeignKey("FK_" + nameof(GeographicalAreaHierarchyMember) + nameof(GeographicalAreaHierarchyMember)));

            Bag(
                geographicalAreaHierarchyMember => geographicalAreaHierarchyMember.Children,
                collectionMapping => collectionMapping.Key(keyMapping => keyMapping.Column("ParentId")));
        }
    }
}
