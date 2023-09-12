using Autofac;
using Iso3166._1;
using Iso3166._2;
using NHibernate;
using NUnit.Framework;
using Service;
using System;

namespace Test
{
    [TestFixture]
    public class TestSubdivisionService: TestNamedService<Guid, Subdivision, NamedFilters>
    {
        private static Guid _subdivisionId = new Guid("8c3c20d8-427c-4d10-aed5-9e304c0ea044");

        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                var subdivision = session.Get<Subdivision>(_subdivisionId);
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
                Guid.NewGuid(),
                "AA",
                "AAA",
                null,
                0,
                "AAA");

            var subdivision = new Subdivision(
                _subdivisionId,
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

