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
            var currencies = (await _csvExtractor.ExtractAsync(
                "ISO4217.csv",
                record => !string.IsNullOrEmpty(record[2]) ?
                    new Currency(
                        record[2],
                        int.Parse(record[3]),
                        record[1],
                        record[4] == "N.A." ? (int?)null : int.Parse(record[4])) : null))
                .Distinct()
                .ToList();

            using(var session = _sessionFactory.OpenSession())
            using(var transaction = session.BeginTransaction())
            {
                foreach(var currency in currencies)
                    await session.SaveAsync(currency);
                await transaction.CommitAsync();
            }

            return currencies;
        }
    }
}
