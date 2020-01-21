using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class GeographicSubregion: SubclassMapping<Locations.GeographicSubregion>
    {
        public GeographicSubregion()
        {
            ManyToOne(
                geographicSubregion => geographicSubregion.Region,
                manyToOneMapper => manyToOneMapper.Column(columnMapper => columnMapper.SqlType(GeographicRegion.IdSqlType)));
        }
    }
}
