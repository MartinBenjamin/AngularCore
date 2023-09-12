using Autofac;
using Iso3166._1;
using NHibernate;
using NUnit.Framework;
using Service;
using System;

namespace Test
{
    [TestFixture]
    public class TestCountryService: TestNamedService<Guid, Country, NamedFilters>
    {
        private static Guid _countryId = new Guid("8c3c20d8-427c-4d10-aed5-9e304c0ea044");

        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                var country = session.Get<Country>(_countryId);
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
                _countryId,
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
