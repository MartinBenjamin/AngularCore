using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    class Country: JoinedSubclassMapping<Iso3166._1.Country>
    {
        public Country()
        {
            Key(
                keyMapper =>
                {
                    keyMapper.Column(
                        columnMapper =>
                        {
                            columnMapper.Name("Alpha2Code");
                            columnMapper.SqlType(GeographicRegion.IdSqlType);
                        });

                    keyMapper.ForeignKey("FK_" + nameof(Country) + nameof(GeographicRegion));
                });

            Property(
                country => country.Alpha2Code,
                propertyMapper =>
                {
                    propertyMapper.Insert(false);
                    propertyMapper.Update(false);
                });

            Property(
                country => country.Alpha3Code,
                propertyMapper =>
                {
                    propertyMapper.Column(columnMapper => columnMapper.SqlType("NCHAR(3)"));
                    propertyMapper.Unique(true);
                    propertyMapper.NotNullable(true);
                });

            Property(
                country => country.Alpha4Code,
                propertyMapper => propertyMapper.Column(columnMapper => columnMapper.SqlType("NCHAR(4)")));

            Property(
                country => country.NumericCode,
                propertyMapper =>
                {
                    propertyMapper.Unique(true);
                    propertyMapper.NotNullable(true);
                });
        }
    }
}
