using Identifiers;
using Iso3166._1._1;
using Locations;
using NHibernate;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Data._1
{
    public class CountryLoader: IEtl
    {
        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;
        private readonly IGuidGenerator  _guidGenerator;

        private static readonly IList<(IdentificationScheme, Func<IList<string>, string>)> _identificationSchemes = new List<(IdentificationScheme, Func<IList<string>, string>)>
        {
            (new IdentificationScheme(new Guid("6f8c62fd-b57f-482b-9a3f-5c2ef9bb8882"), "ISO3166-1 Alpha-2"), record => record[2]),
            (new IdentificationScheme(new Guid("17ffe52a-93f2-4755-835f-f29f1aec41a1"), "ISO3166-1 Alpha-3"), record => record[3]),
            (new IdentificationScheme(new Guid("d8829a3c-f631-40a7-9230-7caae0ad857b"), "ISO3166-1 Numeric"), record => record[4])
        };

        private static readonly string _fileName = "ISO3166-1.csv";

        public static readonly Guid NamespaceId = new Guid("6044628b-f792-405f-9024-072e3fd50d47");

        public CountryLoader(
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
            var records = await _csvExtractor.ExtractAsync(_fileName);

            using(var session = _sessionFactory.OpenSession())
            using(var transaction = session.BeginTransaction())
            {
                //foreach(var (identificationScheme, _) in _identificationSchemes)
                //    await session.SaveAsync(identificationScheme);

                foreach(var record in records)
                {
                    var country = new Country(
                        _guidGenerator.Generate(NamespaceId, record[2]),
                        record[2],
                        record[3],
                        null,
                        int.Parse(record[4]),
                        record[0]);

                    await session.SaveAsync(country);
                    //foreach(var (identificationScheme, tagFactory) in _identificationSchemes)
                    //    await session.SaveAsync(new GeographicRegionIdentifier(
                    //        identificationScheme,
                    //        tagFactory(record),
                    //        country));
                }
                await transaction.CommitAsync();
            }
        }
    }
}
