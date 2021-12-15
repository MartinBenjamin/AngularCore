using CommonDomainObjects;
using Iso3166._1;
using Iso3166._2;
using NHibernate;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Data
{
    public class SubdivisionLoader: IEtl
    {
        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;
        private readonly string          _fileName;

        public SubdivisionLoader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory,
            string          fileName
            )
        {
            _csvExtractor   = csvExtractor;
            _sessionFactory = sessionFactory;
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

                await transaction.CommitAsync();
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
