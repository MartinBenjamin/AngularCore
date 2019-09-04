using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class Currency: ClassMapping<CommonDomainObjects.Currency>
    {
        public Currency()
        {
            Id(
                currency => currency.Id,
                idMapper => idMapper.Column(columnMapper => columnMapper.SqlType("NVARCHAR(3)")));
        }
    }
}
