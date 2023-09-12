using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class Currency: ClassMapping<Iso4217.Currency>
    {
        public Currency()
        {
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
