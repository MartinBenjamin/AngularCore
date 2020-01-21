using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class GeographicRegion: ClassMapping<Locations.GeographicRegion>
    {
        public static readonly string IdSqlType = "NVARCHAR(6)";

        public GeographicRegion()
        {
            Id(
                geographicRegion => geographicRegion.Id,
                idMapper => idMapper.Column(columnMapper => columnMapper.SqlType(IdSqlType)));

            Discriminator(
                discriminatorMapper =>
                {
                    discriminatorMapper.Column("Type");
                    discriminatorMapper.Length(50);
                });

            Bag(
                geographicRegion => geographicRegion.Subregions,
                collectionMapper => collectionMapper.Key(keyMapper => keyMapper.Column("RegionId")));
        }
    }
}
