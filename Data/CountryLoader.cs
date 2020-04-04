using Iso3166._1;
using NHibernate;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Data
{
    public class CountryLoader: IEtl<IEnumerable<Country>>
    {
        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;

        public CountryLoader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory
            )
        {
            _csvExtractor   = csvExtractor;
            _sessionFactory = sessionFactory;
        }

        async Task<IEnumerable<Country>> IEtl<IEnumerable<Country>>.ExecuteAsync()
        {
            var countries = await _csvExtractor.ExtractAsync(
                "ISO3166-1.csv",
                record => new Country(
                    record[2],
                    record[3],
                    null,
                    int.Parse(record[4]),
                    record[0]));

            using(var session = _sessionFactory.OpenSession())
            using(var transaction = session.BeginTransaction())
            {
                foreach(var country in countries)
                    await session.SaveAsync(country);
                await transaction.CommitAsync();
            }

            return countries;
        }
    }
}
