using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class CountryJoin: SubclassMapping<Iso3166._1.Country>
    {
        public CountryJoin()
        {
            Join(
                "Country",
                joinMapper =>
                {
                    joinMapper.Schema("Iso3166_1");
                    joinMapper.Key(
                        keyMapper =>
                        {
                            keyMapper.Column("Id");
                            keyMapper.ForeignKey("FK_" + nameof(Iso3166._1.Country) + "_" + nameof(Locations.GeographicRegion));
                        });

                    joinMapper.Property(
                        country => country.Id,
                        propertyMapper =>
                        {
                            propertyMapper.Insert(false);
                            propertyMapper.Update(false);
                        });

                    joinMapper.Property(
                        country => country.Alpha2Code,
                        propertyMapper =>
                        {
                            propertyMapper.Column(columnMapper => columnMapper.SqlType("NCHAR(2)"));
                            propertyMapper.Unique(true);
                            propertyMapper.NotNullable(true);
                        });

                    joinMapper.Property(
                        country => country.Alpha3Code,
                        propertyMapper =>
                        {
                            propertyMapper.Column(columnMapper => columnMapper.SqlType("NCHAR(3)"));
                            propertyMapper.Unique(true);
                            propertyMapper.NotNullable(true);
                        });

                    joinMapper.Property(
                        country => country.Alpha4Code,
                        propertyMapper => propertyMapper.Column(columnMapper => columnMapper.SqlType("NCHAR(4)")));

                    joinMapper.Property(
                        country => country.NumericCode,
                        propertyMapper =>
                        {
                            propertyMapper.Unique(true);
                            propertyMapper.NotNullable(true);
                        });

                    joinMapper.Property(
                        country => country.ShortName);
                });
        }
    }
}
