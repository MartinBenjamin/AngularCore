using Locations;
using NHibernate;
using NHibernate.Criterion;
using System;
using System.Data;
using System.Threading.Tasks;

namespace Service
{
    public class GeographicRegionHierarchyService: IDomainObjectService<Guid, GeographicRegionHierarchy>
    {
        protected readonly ISession _session;

        public GeographicRegionHierarchyService(
            ISession session
            )
        {
            _session = session;
        }

        Task<GeographicRegionHierarchy> IDomainObjectService<Guid, GeographicRegionHierarchy>.GetAsync(
            Guid id
            )
        {
            using(_session.BeginTransaction(IsolationLevel.ReadCommitted))
            {
                _session
                    .CreateCriteria<GeographicRegion>()
                    .Fetch("Subregions")
                    .Future<GeographicRegion>();
                _session
                    .CreateCriteria<GeographicRegionHierarchyMember>()
                    .Fetch("Children")
                    .CreateCriteria("Hierarchy")
                        .Add(Expression.Eq("Id", id))
                    .Future<GeographicRegionHierarchyMember>();
                return _session
                    .CreateCriteria<GeographicRegionHierarchy>()
                    .Add(Expression.Eq("Id", id))
                    .Fetch("Members")
                    .FutureValue<GeographicRegionHierarchy>().GetValueAsync();
            }
        }
    }
}
