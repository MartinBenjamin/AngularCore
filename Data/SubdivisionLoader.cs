using CommonDomainObjects;
using Iso3166._1;
using Iso3166._2;
using NHibernate;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Data
{
    public class SubdivisionLoader: IEtl<IEnumerable<Subdivision>>
    {
        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;

        public SubdivisionLoader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory
            )
        {
            _csvExtractor   = csvExtractor;
            _sessionFactory = sessionFactory;
        }

        async Task<IEnumerable<Subdivision>> IEtl<IEnumerable<Subdivision>>.ExecuteAsync()
        {
            using(var session = _sessionFactory.OpenSession())
            using(var transaction = session.BeginTransaction())
            {
                var countries = session
                    .CreateCriteria<Country>()
                    .List<Country>();
                var records = new[]
                {
                    "ISO3166-2-AE.csv",
                    "ISO3166-2-CA.csv",
                    "ISO3166-2-GB.csv",
                    "ISO3166-2-PT.csv",
                    "ISO3166-2-US.csv"
                }.SelectMany(_csvExtractor.Extract);

                var parentRecord = (
                    from child in records
                    join parent in records on child[6] equals parent[1] into parents
                    select
                    (
                        Child: child,
                        Parents: (IList<IList<string>>)parents
                    )
                ).ToDictionary(
                    tuple => tuple.Child,
                    tuple => tuple.Parents);

                var childRecord = parentRecord.Transpose();

                var subdivisions = (
                    from record in parentRecord.Keys
                    where parentRecord[record].Count == 0
                    let countryCode = record[1].Substring(0, 2)
                    from country in countries
                    where country.Id == countryCode
                    select CreateSubdivision(
                        childRecord,
                        country,
                        record,
                        null)
                ).ToList();

                await subdivisions.ForEachAsync(
                    subdivision => subdivision.VisitAsync(geographicRegion => session.SaveAsync(geographicRegion)));

                transaction.Commit();

                IList<Subdivision> loaded = new List<Subdivision>();
                subdivisions.ForEach(
                    subdivision => subdivision.Visit(geographicRegion => loaded.Add((Subdivision)geographicRegion)));
                return loaded;
            }

        }

        private Subdivision CreateSubdivision(
            IDictionary<IList<string>, IList<IList<string>>> childRecord,
            Country                                          country,
            IList<string>                                    record,
            Subdivision                                      parent
            )
        {
            var subdivision = new Subdivision(
                record[1],
                record[2],
                country,
                parent,
                record[0]);

            foreach(var child in childRecord[record])
                CreateSubdivision(
                    childRecord,
                    country,
                    child,
                    subdivision);

            return subdivision;
        }
    }
}
