using CommonDomainObjects;
using Identifiers;
using Iso3166._1;
using Iso3166._2;
using Locations;
using NHibernate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Data
{
    public class SubdivisionLoader: IEtl
    {
        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;
        private readonly IGuidGenerator  _guidGenerator;
        private readonly string          _fileName;

        private static readonly Guid _identificationSchemeId = new Guid("0eedfbae-fec6-474c-b447-6f30af710e01");

        public SubdivisionLoader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory,
            IGuidGenerator  guidGenerator,
            string          fileName
            )
        {
            _csvExtractor   = csvExtractor;
            _sessionFactory = sessionFactory;
            _guidGenerator  = guidGenerator;
            _fileName       = fileName;
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
                var countries = session
                    .CreateCriteria<Country>()
                    .List<Country>();
                var records = await _csvExtractor.ExtractAsync(_fileName);
                var parentRecord = (
                    from child in records
                    join parent in records on child[6] equals parent[1] into parents
                    select
                    (
                        Child: child,
                        Parent: (IList<IList<string>>)parents
                    )
                ).ToDictionary(
                    tuple => tuple.Child,
                    tuple => tuple.Parent);

                var childRecord = parentRecord.Transpose();

                var regionSubregionAssociations = new List<GeographicRegionSubregion>();

                var subdivisions = (
                    from record in parentRecord.Keys
                    where parentRecord[record].Count == 0
                    let countryCode = record[1].Substring(0, 2)
                    from country in countries
                    where country.Alpha2Code == countryCode
                    select CreateSubdivision(
                        childRecord,
                        country,
                        record,
                        null,
                        regionSubregionAssociations)
                ).ToList();

                await subdivisions.ForEachAsync(
                    subdivision => subdivision.VisitAsync(geographicRegion => session.SaveAsync(geographicRegion)));

                await regionSubregionAssociations.ForEachAsync(
                    regionSubregionAssociation => session.SaveAsync(regionSubregionAssociation));

                var identificationScheme = await session.GetAsync<IdentificationScheme>(_identificationSchemeId);
                if(identificationScheme == null)
                {
                    identificationScheme = new IdentificationScheme(
                        _identificationSchemeId,
                        "ISO3166-2");
                    await session.SaveAsync(identificationScheme);
                }

                await subdivisions.ForEachAsync(
                    subdivision => subdivision.VisitAsync(
                        geographicRegion => session.SaveAsync(
                            new GeographicRegionIdentifier(
                                identificationScheme,
                                ((Subdivision)geographicRegion).Code,
                                geographicRegion))));

                await transaction.CommitAsync();
            }
        }

        private Subdivision CreateSubdivision(
            IDictionary<IList<string>, IList<IList<string>>> childRecord,
            Country                                          country,
            IList<string>                                    record,
            Subdivision                                      parent,
            IList<GeographicRegionSubregion>                 regionSubregionAssociations
            )
        {
            var subdivision = new Subdivision(
                _guidGenerator.Generate(CountryLoader.NamespaceId, record[1]),
                record[1],
                record[2],
                country,
                parent,
                record[0]);

            regionSubregionAssociations.Add(
                new GeographicRegionSubregion(
                    (GeographicRegion)parent ?? country,
                    subdivision));

            foreach(var child in childRecord[record])
                CreateSubdivision(
                    childRecord,
                    country,
                    child,
                    subdivision,
                    regionSubregionAssociations);

            return subdivision;
        }
    }
}
