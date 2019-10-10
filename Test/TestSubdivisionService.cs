using Autofac;
using Iso3166._1;
using Iso3166._2;
using NHibernate;
using NUnit.Framework;
using Service;

namespace Test
{
    [TestFixture]
    public class TestSubdivisionService: TestNamedService<string, Subdivision, NamedFilters>
    {
        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                var subdivision = session.Get<Subdivision>("AA-AAA");
                if(subdivision != null)
                {
                    session.Delete(subdivision.Country);
                    session.Delete(subdivision);
                }

                session.Flush();
            }
        }

        public override Subdivision Create(
            string name
            )
        {
            var country = new Country(
                "AA",
                "AAA",
                null,
                0,
                "AAA");

            var subdivision = new Subdivision(
                "AA-AAA",
                name,
                country,
                null,
                "subdivision");

            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                session.Save(country);
                session.Save(subdivision);
                session.Flush();
            }

            return subdivision;
        }
    }
}

