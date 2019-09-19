using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class Currency: ClassMapping<Iso4217.Currency>
    {
        public Currency()
        {
            Id(
                currency => currency.Id,
                idMapper => idMapper.Column(columnMapper => columnMapper.SqlType("NVARCHAR(3)")));
        }
    }
}
