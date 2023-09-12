using Autofac;
using Iso3166._1;
using Locations;
using NHibernate;
using NUnit.Framework;
using Service;
using System;

namespace Test
{
    [TestFixture]
    public class TestGeographicRegionService: TestNamedService<Guid, GeographicRegion, NamedFilters>
    {
        private static Guid _geograpicRegionId = new Guid("8c3c20d8-427c-4d10-aed5-9e304c0ea044");

        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                var geographicRegion = session.Get<Country>(_geograpicRegionId);
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
                _geograpicRegionId,
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
