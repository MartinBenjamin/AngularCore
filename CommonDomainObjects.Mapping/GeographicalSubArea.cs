using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class GeographicalSubArea: SubclassMapping<CommonDomainObjects.GeographicalSubArea>
    {
        public GeographicalSubArea()
        {
            ManyToOne(
                geographicalSubArea => geographicalSubArea.Area,
                manyToOneMapper => manyToOneMapper.Column(columnMapper => columnMapper.SqlType(GeographicalArea.IdSqlType)));
        }
    }
}
