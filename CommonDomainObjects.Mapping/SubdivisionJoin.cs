using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class SubdivisionJoin: SubclassMapping<Iso3166._2.Subdivision>
    {
        public SubdivisionJoin()
        {
            Join(
                "Subdivision",
                joinMapper =>
                {
                    DiscriminatorValue("Subdivision");

                    joinMapper.Key(
                        keyMapper =>
                        {
                            keyMapper.Column(
                                columnMapper =>
                                {
                                    columnMapper.Name("Code");
                                    columnMapper.SqlType(GeographicRegion.IdSqlType);
                                });

                            keyMapper.ForeignKey("FK_" + nameof(Subdivision) + "_" + nameof(GeographicRegion));
                        });

                    joinMapper.Property(
                        subdivision => subdivision.Code,
                        propertyMapper =>
                        {
                            propertyMapper.Insert(false);
                            propertyMapper.Update(false);
                        });

                    joinMapper.ManyToOne(
                        subdivision => subdivision.Country,
                        manyToOneMapper => manyToOneMapper.Column(columnMapper => columnMapper.SqlType(GeographicRegion.IdSqlType)));

                    joinMapper.ManyToOne(
                        subdivision => subdivision.ParentSubdivision,
                        manyToOneMapper => manyToOneMapper.Column(columnMapper => columnMapper.SqlType(GeographicRegion.IdSqlType)));

                    joinMapper.Property(
                        subdivision => subdivision.Category);
                });
        }
    }
}
