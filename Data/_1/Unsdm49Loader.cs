using Iso3166._1._1;
using Locations._1;
using NHibernate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using UnsdM49._1;

namespace Data._1
{
    public class Unsdm49Loader: IEtl
    {
        private static readonly Func<Guid, string, GeographicRegion>[] _levels = new Func<Guid, string, GeographicRegion>[]
            {
                (Guid id, string name) => new Global            (id, name),
                (Guid id, string name) => new Region            (id, name),
                (Guid id, string name) => new SubRegion         (id, name),
                (Guid id, string name) => new IntermediateRegion(id, name)
            };

        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;
        private readonly IGuidGenerator  _guidGenerator;

        private static readonly string _fileName = "UNSDM49.csv";

        public Unsdm49Loader(
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
            using(var session = _sessionFactory.OpenSession())
            using(var transaction = session.BeginTransaction())
            {
                var countries = (await session
                    .CreateCriteria<Country>()
                    .ListAsync<Country>())
                    .ToDictionary(
                        country => country.Alpha3Code,
                        country => country);

                var records = await _csvExtractor.ExtractAsync(_fileName);
                var geographicRegions = new Dictionary<string, GeographicRegion>();
                var regionSubregionAssociations = new List<GeographicRegionSubregion>();
                foreach(var record in records)
                    if(countries.TryGetValue(
                        record[10],
                        out var country))
                    {
                        geographicRegions[record[9]] = country;
                        GeographicSubregion subregion = country;
                        var level = _levels.Length - 1;
                        while(level >= 0)
                        {
                            var code = record[level * 2];
                            if(code != string.Empty)
                            {
                                geographicRegions.TryGetValue(
                                    code,
                                    out var region);

                                if(region == null)
                                {
                                    region = _levels[level](
                                        _guidGenerator.Generate(CountryLoader.NamespaceId, code),
                                        record[level * 2 + 1]);
                                    await session.SaveAsync(region);

                                    geographicRegions[code] = region;
                                }

                                await session.SaveAsync(
                                    new GeographicRegionSubregion(
                                        region,
                                        subregion));

                                subregion = region as GeographicSubregion;
                            }

                            level -= 1;
                        }
                    }

                await transaction.CommitAsync();
            }
        }
    }
}
