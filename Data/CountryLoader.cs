using Identifiers;
using Iso3166._1;
using Locations;
using NHibernate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Data
{
    public class CountryLoader: IEtl<IEnumerable<Country>>
    {
        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;

        private static readonly IList<(IdentificationScheme, Func<Country, string>)> _identificationSchemes = new List<(IdentificationScheme, Func<Country, string>)>
        {
            (new IdentificationScheme(new Guid("6f8c62fd-b57f-482b-9a3f-5c2ef9bb8882"), "ISO3166-1 Alpha-2"), country => country.Alpha2Code                 ),
            (new IdentificationScheme(new Guid("17ffe52a-93f2-4755-835f-f29f1aec41a1"), "ISO3166-1 Alpha-3"), country => country.Alpha3Code                 ),
            (new IdentificationScheme(new Guid("d8829a3c-f631-40a7-9230-7caae0ad857b"), "ISO3166-1 Numeric"), country => country.NumericCode.ToString("000"))
        };

        private static readonly IList<Func<Country, string>> _tagFactories = new List<Func<Country, string>>
        {
            country => country.Alpha2Code,
            country => country.Alpha3Code,
            country => country.NumericCode.ToString("000")
        };

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
                foreach(var identificationScheme in _identificationSchemes)
                    await session.SaveAsync(identificationScheme.Item1);

                foreach(var country in countries)
                {
                    await session.SaveAsync(country);
                    foreach(var identificationScheme in _identificationSchemes)
                        await session.SaveAsync(new GeographicRegionIdentifier(
                            identificationScheme.Item1,
                            identificationScheme.Item2(country),
                            country));
                }
                await transaction.CommitAsync();
            }

            return countries;
        }
    }
}
