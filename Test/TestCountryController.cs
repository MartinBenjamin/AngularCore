using Autofac;
using Iso3166._1;
using NHibernate;
using NUnit.Framework;
using Service;
using Web.Controllers;

namespace Test
{
    [TestFixture]
    public class TestCountryController: TestNamedController<string, Country, NamedFilters, Web.Model.Country, NamedFilters, CountryController>
    {
        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                var country = session.Get<Country>("AA");
                if(country != null)
                    session.Delete(country);

                session.Flush();
            }
        }

        public override Country Create(
            string name
            )
        {
            var country = new Country(
                "AA",
                "AAA",
                null,
                0,
                name);

            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                session.Save(country);
                session.Flush();
            }

            return country;
        }
    }
}
