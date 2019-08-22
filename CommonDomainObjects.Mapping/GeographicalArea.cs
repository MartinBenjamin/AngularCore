using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class GeographicalArea: ClassMapping<CommonDomainObjects.GeographicalArea>
    {
        public GeographicalArea()
        {
            Id(
                geographicalArea => geographicalArea.Id,
                idMapper => idMapper.Column(columnMapper => columnMapper.SqlType("NCHAR(2)")));

            ManyToOne(
                geographicalArea => geographicalArea.Parent,
                manyToOneMapper => manyToOneMapper.Column(columnMapper => columnMapper.SqlType("NCHAR(2)")));

            Bag(
                geographicalArea => geographicalArea.Children,
                collectionMapper => collectionMapper.Key(
                    keyMapper => keyMapper.Column("ParentId")));
        }
    }
}
