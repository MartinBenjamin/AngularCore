using CommonDomainObjects;
using NHibernate;
using System.Threading.Tasks;

namespace Data
{
    public class GeographicalAreaHierarchyLoader: ILoader<GeographicalAreaHierarchy>
    {
        private ISessionFactory _sessionFactory;

        public GeographicalAreaHierarchyLoader(
            ISessionFactory sessionFactory
            )
        {
            _sessionFactory = sessionFactory;
        }

        async Task ILoader<GeographicalAreaHierarchy>.LoadAsync(
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
