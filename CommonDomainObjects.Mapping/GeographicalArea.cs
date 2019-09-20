using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class GeographicalArea: ClassMapping<CommonDomainObjects.GeographicalArea>
    {
        public static readonly string IdSqlType = "NVARCHAR(6)";

        public GeographicalArea()
        {
            Id(
                geographicalArea => geographicalArea.Id,
                idMapper => idMapper.Column(columnMapper => columnMapper.SqlType(IdSqlType)));

            Discriminator(
                discriminatorMapper =>
                {
                    discriminatorMapper.Column("Type");
                    discriminatorMapper.Length(50);
                });

            Bag(
                geographicalArea => geographicalArea.SubAreas,
                collectionMapper => collectionMapper.Key(keyMapper => keyMapper.Column("AreaId")));
        }
    }

    public class GeographicalSubArea: SubclassMapping<CommonDomainObjects.GeographicalSubArea>
    {

        public GeographicalSubArea()
        {
            ManyToOne(
                geographicalArea => geographicalArea.Area,
                manyToOneMapper => manyToOneMapper.Column(columnMapper => columnMapper.SqlType(GeographicalArea.IdSqlType)));
        }
    }
}
