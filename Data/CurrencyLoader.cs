using Iso4217;
using NHibernate;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Data
{
    public class CurrencyLoader: IEtl<IEnumerable<Currency>>
    {
        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;

        public CurrencyLoader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory
            )
        {
            _csvExtractor   = csvExtractor;
            _sessionFactory = sessionFactory;
        }

        async Task<IEnumerable<Currency>> IEtl<IEnumerable<Currency>>.ExecuteAsync()
        {
            var currencies = _csvExtractor.Extract(
                "ISO4217.csv",
                record => !string.IsNullOrEmpty(record[2]) ?
                    new Currency(
                        record[2],
                        int.Parse(record[3]),
                        record[1],
                        record[4] == "N.A." ? (int?)null : int.Parse(record[4])) : null)
                .Distinct()
                .ToList();

            await LoadAsync(currencies);
            return currencies;
        }

        private async Task LoadAsync(
            IEnumerable<Currency> currencies
            )
        {
            using(var session = _sessionFactory.OpenSession())
            {
                foreach(var currency in currencies)
                    await session.SaveAsync(currency);
                await session.FlushAsync();
            }
        }
    }
}
