using CommonDomainObjects;
using Iso3166._1;
using Iso3166._2;
using NHibernate;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Data
{
    public class GeographicalAreaHierarchyLoader: IEtl<GeographicalAreaHierarchy>
    {
        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;

        public GeographicalAreaHierarchyLoader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory
            )
        {
            _csvExtractor   = csvExtractor;
            _sessionFactory = sessionFactory;
        }

        async Task<GeographicalAreaHierarchy> IEtl<GeographicalAreaHierarchy>.ExecuteAsync()
        {
            var emptyGeographicalAreaArray = new GeographicalArea[] { };
            IDictionary<string, GeographicalArea> areaMap = ExtractIso3166_1()
                .Cast<GeographicalArea>()
                .ToDictionary(country => country.Id);

            var areaHierarchy = areaMap
                .Values
                .ToDictionary<GeographicalArea, GeographicalArea, IList<GeographicalArea>>(
                    area => area,
                    area => emptyGeographicalAreaArray);

            var recordMap = new[]
            {
                "ISO3166-2(GB).csv",
                "ISO3166-2(US).csv"
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
                            parent = (Subdivision)areaMap[parentCode];

                        var country = (Country)areaMap[countryCode];

                        var subdivision = new Subdivision(
                            code,
                            record[2],
                            country,
                            parent,
                            record[0]);

                        areaMap[subdivision.Id] = subdivision;
                        areaHierarchy[subdivision] = new[] { subdivision.Area };
                    });

            var geographicalAreaHierarchy = new GeographicalAreaHierarchy(areaHierarchy);
            await LoadAsync(geographicalAreaHierarchy);
            return geographicalAreaHierarchy;
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
            GeographicalAreaHierarchy hierarchy
            )
        {
            using(var session = _sessionFactory.OpenSession())
            {
                await session.SaveAsync(hierarchy);
                await hierarchy.VisitAsync(
                    async member =>
                    {
                        await session.SaveAsync(member.Member);
                        await session.SaveAsync(member);
                    });
                await session.FlushAsync();
            }
        }
    }
}
