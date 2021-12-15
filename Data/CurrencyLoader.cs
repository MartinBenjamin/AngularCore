using Iso4217;
using NHibernate;
using System.Linq;
using System.Threading.Tasks;

namespace Data
{
    public class CurrencyLoader: IEtl
    {
        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;

        private readonly string _fileName = "ISO4217.csv";

        public CurrencyLoader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory
            )
        {
            _csvExtractor   = csvExtractor;
            _sessionFactory = sessionFactory;
        }

        string IEtl.FileName
        {
            get => _fileName;
        }

        async Task IEtl.ExecuteAsync()
        {
            var currencies = (await _csvExtractor.ExtractAsync(
                _fileName,
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
        }
    }
}
