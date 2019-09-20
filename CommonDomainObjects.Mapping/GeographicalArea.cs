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

            ManyToOne(
                geographicalArea => geographicalArea.Parent,
                manyToOneMapper => manyToOneMapper.Column(columnMapper => columnMapper.SqlType(IdSqlType)));

            Bag(
                geographicalArea => geographicalArea.Children,
                collectionMapper => collectionMapper.Key(keyMapper => keyMapper.Column("ParentId")));
        }
    }
}
