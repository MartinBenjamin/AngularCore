using NHibernate.Mapping.ByCode;
using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class GeographicRegionIdentifier: JoinedSubclassMapping<Locations.GeographicRegionIdentifier>
    {
        public GeographicRegionIdentifier()
        {
            Key(
                keyMapper =>
                {
                    keyMapper.Columns(
                        columnMapper => columnMapper.Name("SchemeId"),
                        columnMapper => columnMapper.Name("Tag"     ));
                });

            ManyToOne(
                identifier => identifier.GeographicRegion,
                manyToOneMapper => manyToOneMapper.Column(
                    columnMapper =>
                    {
                        columnMapper.Name("IdentifiedId");
                        columnMapper.SqlType(GeographicRegion.IdSqlType);
                    }));
        }
    }

    public class GeographicRegionIdentifier2: JoinedSubclassMapping<Identifiers.Identifier<Locations.GeographicRegion>>
    {
        public GeographicRegionIdentifier2()
        {
            this.SchemaAction(NHibernate.Mapping.ByCode.SchemaAction.None);
            Table("GeographicRegionIdentifier");

            Key(
                keyMapper =>
                {
                    keyMapper.Columns(
                        columnMapper => columnMapper.Name("SchemeId"),
                        columnMapper => columnMapper.Name("Tag"));
                });

            ManyToOne(
                identifier => identifier.Identified,
                manyToOneMapper => manyToOneMapper.Column(
                    columnMapper =>
                    {
                        columnMapper.Name("IdentifiedId");
                        columnMapper.SqlType(GeographicRegion.IdSqlType);
                    }));
        }
    }
}
