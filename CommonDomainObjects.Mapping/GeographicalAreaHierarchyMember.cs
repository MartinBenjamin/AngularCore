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

            Bag(
                geographicalAreaHierarchyMember => geographicalAreaHierarchyMember.Children,
                collectionMapping => collectionMapping.Key(keyMapping => keyMapping.Column("ParentId")));
        }
    }
}
