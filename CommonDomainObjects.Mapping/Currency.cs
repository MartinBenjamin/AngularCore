using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class Currency: ClassMapping<Iso4217.Currency>
    {
        public Currency()
        {
            Id(
                currency => currency.Id,
                idMapper => idMapper.Column(columnMapper => columnMapper.SqlType("NCHAR(3)")));

            Property(
                    currency => currency.AlphabeticCode,
                    propertyMapper =>
                    {
                        propertyMapper.Column(columnMapper => columnMapper.SqlType("NCHAR(3)"));
                        propertyMapper.Unique(true);
                        propertyMapper.NotNullable(true);
                    });
        }
    }
}
