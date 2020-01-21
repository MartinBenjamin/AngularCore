using Autofac;
using Iso3166._1;
using Locations;
using NHibernate;
using NUnit.Framework;
using Service;

namespace Test
{
    [TestFixture]
    public class TestGeographicRegionService: TestNamedService<string, GeographicRegion, NamedFilters>
    {
        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                var geographicRegion = session.Get<Country>("AA");
                if(geographicRegion != null)
                    session.Delete(geographicRegion);

                session.Flush();
            }
        }

        public override GeographicRegion Create(
            string name
            )
        {
            var geographicRegion = new Country(
                "AA",
                "AAA",
                null,
                0,
                name);

            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                session.Save(geographicRegion);
                session.Flush();
            }

            return geographicRegion;
        }
    }
}
