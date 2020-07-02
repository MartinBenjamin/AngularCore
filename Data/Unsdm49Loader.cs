using CommonDomainObjects;
using Iso3166._1;
using Locations;
using NHibernate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using UnsdM49;

namespace Data
{
    public class Unsdm49Loader: IEtl<GeographicRegionHierarchy>
    {
        private static readonly Func<string, string, GeographicRegion, GeographicRegion>[] _levels = new Func<string, string, GeographicRegion, GeographicRegion>[]
            {
                (string code, string name, GeographicRegion geographicRegion) => new Global            (code, name                  ),
                (string code, string name, GeographicRegion geographicRegion) => new Region            (code, name, geographicRegion),
                (string code, string name, GeographicRegion geographicRegion) => new SubRegion         (code, name, geographicRegion),
                (string code, string name, GeographicRegion geographicRegion) => new IntermediateRegion(code, name, null            )
            };

        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;

        public Unsdm49Loader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory
            )
        {
            _csvExtractor   = csvExtractor;
            _sessionFactory = sessionFactory;
        }

        async Task<GeographicRegionHierarchy> IEtl<GeographicRegionHierarchy>.ExecuteAsync()
        {

            using(var session = _sessionFactory.OpenSession())
            using(var transaction = session.BeginTransaction())
            {
                // Populate session.
                await session
                    .CreateCriteria<GeographicRegion>()
                    .Fetch("Subregions")
                    .ListAsync<GeographicRegion>();

                var geographicRegions = await session
                    .CreateCriteria<GeographicRegion>()
                    .ListAsync<GeographicRegion>();

                var countries = geographicRegions.OfType<Country>().ToDictionary(
                    country => country.Alpha3Code,
                    country => (GeographicRegion)country);

                var countryParent = (await _csvExtractor
                    .ExtractAsync("UNSDM49.csv"))
                    .Where(record => countries.ContainsKey(record[record.Count - 5/* Deal with incorrectly encoded RFC4180 file.*/]))
                    .Select(
                        record =>
                        (
                            Child: countries[record[record.Count - 5/* Deal with incorrectly encoded RFC4180 file.*/]],
                            Parent: (IList<GeographicRegion>)new List<GeographicRegion>
                            {
                                GetParent(
                                    session,
                                    geographicRegions,
                                    record,
                                    _levels.Length - 1)
                            }
                        )).ToList();

                var parent = (
                    from region in geographicRegions.Where(geographicRegion => !geographicRegion.Is<Country>())
                    join subregion in geographicRegions.OfType<GeographicSubregion>() on region equals subregion into subregions
                    select
                    (
                        Child: region,
                        Parent: (IList<GeographicRegion>)subregions.Select(subregion => subregion.Region).ToList()
                    )).Concat(countryParent).ToDictionary(
                        tuple => tuple.Child,
                        tuple => tuple.Parent);

                var hierarchy = new GeographicRegionHierarchy(parent);

                await session.SaveAsync(hierarchy);
                await hierarchy.VisitAsync(async member => await session.SaveAsync(member));
                await transaction.CommitAsync();

                return hierarchy;
            }
        }

        private GeographicRegion GetParent(
            ISession                session,
            IList<GeographicRegion> geographicRegions,
            IList<string>           record,
            int                     level
            )
        {
            var code = record[level * 2];
            if(code == string.Empty)
                return GetParent(
                    session,
                    geographicRegions,
                    record,
                    level - 1);

            var geographicRegion = session.Get<GeographicRegion>(code);
            if(geographicRegion == null)
            {
                GeographicRegion parentGeographicRegion = null;
                if(level > 0)
                    parentGeographicRegion = GetParent(
                        session,
                        geographicRegions,
                        record,
                        level - 1);

                geographicRegion = _levels[level](
                    code,
                    record[level * 2 + 1],
                    parentGeographicRegion);

                session.Save(geographicRegion);
                geographicRegions.Add(geographicRegion);
            }

            return geographicRegion;
        }
    }
}
