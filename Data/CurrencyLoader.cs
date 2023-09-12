using Iso4217;
using NHibernate;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Data
{
    public class CurrencyLoader: IEtl
    {
        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;
        private readonly IGuidGenerator  _guidGenerator;

        private static readonly string _fileName = "ISO4217.csv";

        public static readonly Guid NamespaceId = new Guid("d77eed95-4ed4-4d30-b939-86df917e6c3f");

        public CurrencyLoader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory,
            IGuidGenerator  guidGenerator
            )
        {
            _csvExtractor   = csvExtractor;
            _sessionFactory = sessionFactory;
            _guidGenerator  = guidGenerator;
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
                        _guidGenerator.Generate(NamespaceId, record[2]),
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
