using CommonDomainObjects;
using Iso3166._1;
using Iso3166._2;
using Locations;
using NHibernate;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Data
{
    public class GeographicRegionHierarchyLoader: IEtl<GeographicRegionHierarchy>
    {
        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;

        public GeographicRegionHierarchyLoader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory
            )
        {
            _csvExtractor   = csvExtractor;
            _sessionFactory = sessionFactory;
        }

        async Task<GeographicRegionHierarchy> IEtl<GeographicRegionHierarchy>.ExecuteAsync()
        {
            var emptyGeographicRegionArray = new GeographicRegion[] { };
            IDictionary<string, GeographicRegion> regionMap = ExtractIso3166_1()
                .Cast<GeographicRegion>()
                .ToDictionary(country => country.Id);

            var regionHierarchy = regionMap
                .Values
                .ToDictionary<GeographicRegion, GeographicRegion, IList<GeographicRegion>>(
                    region => region,
                    region => emptyGeographicRegionArray);

            var recordMap = new[]
            {
                "ISO3166-2-AE.csv",
                "ISO3166-2-CA.csv",
                "ISO3166-2-GB.csv",
                "ISO3166-2-PT.csv",
                "ISO3166-2-US.csv"
            }.SelectMany(fileName => _csvExtractor.Extract(fileName))
            .ToDictionary(record => record[1]);

            var emptyRecordArray = new IList<string>[] { };
            var recordHierarchy = recordMap
                .Values
                .ToDictionary<IList<string>, IList<string>, IList<IList<string>>>(
                    record => record,
                    record =>
                    {
                        var parentCode = record[6];
                        return string.IsNullOrEmpty(parentCode) ? emptyRecordArray : new IList<string>[] { recordMap[parentCode] };
                    });

            recordHierarchy
                .TopologicalSort()
                .ToList()
                .ForEach(
                    record =>
                    {
                        var code        = record[1];
                        var parentCode  = record[6];
                        var countryCode = code.Substring(0, 2);

                        Subdivision parent = null;
                        if(!string.IsNullOrEmpty(parentCode))
                            parent = (Subdivision)regionMap[parentCode];

                        var country = (Country)regionMap[countryCode];

                        var subdivision = new Subdivision(
                            code,
                            record[2],
                            country,
                            parent,
                            record[0]);

                        regionMap[subdivision.Id] = subdivision;
                        regionHierarchy[subdivision] = new[] { subdivision.Region };
                    });

            var geographicRegionHierarchy = new GeographicRegionHierarchy(regionHierarchy);
            await LoadAsync(geographicRegionHierarchy);
            return geographicRegionHierarchy;
        }

        private IList<Country> ExtractIso3166_1()
        {
            return _csvExtractor.Extract(
                "ISO3166-1.csv",
                record => new Country(
                    record[2],
                    record[3],
                    null,
                    int.Parse(record[4]),
                    record[0]));
        }

        private async Task LoadAsync(
            GeographicRegionHierarchy hierarchy
            )
        {
            using(var session = _sessionFactory.OpenSession())
            using(var transaction = session.BeginTransaction())
            {
                await session.SaveAsync(hierarchy);
                await hierarchy.VisitAsync(
                    async member =>
                    {
                        await session.SaveAsync(member.Member);
                        await session.SaveAsync(member);
                    });
                await transaction.CommitAsync();
            }
        }
    }
}
