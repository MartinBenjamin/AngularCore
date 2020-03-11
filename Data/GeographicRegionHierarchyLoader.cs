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
            using(var session = _sessionFactory.OpenSession())
            using(var transaction = session.BeginTransaction())
            {
                await session
                   .CreateCriteria<GeographicRegion>()
                   .Fetch("Subregions")
                   .ListAsync<GeographicRegion>();

                var geographicRegions = await session
                    .CreateCriteria<GeographicRegion>()
                    .ListAsync<GeographicRegion>();

                var parent = (
                    from region in geographicRegions
                    join subregion in geographicRegions.OfType<GeographicSubregion>() on region equals subregion into subregions
                    select
                    (
                        Child : region,
                        Parent: (IList<GeographicRegion>)subregions.Select(subregion => subregion.Region).ToList()
                    )).ToDictionary(
                        tuple => tuple.Child,
                        tuple => tuple.Parent);

                var hierarchy = new GeographicRegionHierarchy(parent);

                await session.SaveAsync(hierarchy);
                await hierarchy.VisitAsync(
                    async member =>
                    {
                        await session.SaveAsync(member.Member);
                        await session.SaveAsync(member);
                    });
                await transaction.CommitAsync();

                return hierarchy;
            }
        }
    }
}
