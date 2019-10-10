using Autofac;
using NHibernate;
using NUnit.Framework;
using Service;
using UnsdM49;

namespace Test
{
    [TestFixture]
    public class TestRegionService: TestNamedService<string, Region, NamedFilters>
    {
        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                var region = session.Get<Region>("002");
                if(region != null)
                    session.Delete(region);

                session.Flush();
            }
        }

        public override Region Create(
            string name
            )
        {
            var region = new Region(
                "002",
                name,
                null);

            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                session.Save(region);
                session.Flush();
            }

            return region;
        }
    }
}
