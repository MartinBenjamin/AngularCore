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
                    DiscriminatorValue("Country");

                    joinMapper.Key(
                        keyMapper =>
                        {
                            keyMapper.Column(
                                columnMapper =>
                                {
                                    columnMapper.Name("Alpha2Code");
                                    columnMapper.SqlType(GeographicalArea.IdSqlType);
                                });

                            keyMapper.ForeignKey("FK_" + nameof(Country) + nameof(GeographicalArea));
                        });

                    joinMapper.Property(
                        country => country.Alpha2Code,
                        propertyMapper =>
                        {
                            propertyMapper.Insert(false);
                            propertyMapper.Update(false);
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
