using Autofac;
using CommonDomainObjects;
using Iso3166._1;
using NHibernate;
using NUnit.Framework;
using Service;

namespace Test
{
    [TestFixture]
    public class TestGeographicalAreaService: TestNamedService<string, GeographicalArea, NamedFilters>
    {
        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                var geographicalArea = session.Get<Country>("AA");
                if(geographicalArea != null)
                    session.Delete(geographicalArea);

                session.Flush();
            }
        }

        public override GeographicalArea Create(
            string name
            )
        {
            var geographicalArea = new Country(
                "AA",
                "AAA",
                null,
                0,
                name);

            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                session.Save(geographicalArea);
                session.Flush();
            }

            return geographicalArea;
        }
    }
}
