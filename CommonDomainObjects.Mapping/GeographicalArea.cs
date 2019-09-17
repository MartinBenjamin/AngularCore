using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class GeographicalArea: ClassMapping<CommonDomainObjects.GeographicalArea>
    {
        public GeographicalArea()
        {
            Id(
                geographicalArea => geographicalArea.Id,
                idMapper => idMapper.Column(columnMapper => columnMapper.SqlType("NVARCHAR(6)")));
        }
    }
}
