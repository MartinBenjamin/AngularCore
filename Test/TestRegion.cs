using Autofac;
using NHibernate;
using NUnit.Framework;
using Service;
using System;
using UnsdM49;

namespace Test
{
    [TestFixture]
    public class TestRegionService: TestNamedService<Guid, Region, NamedFilters>
    {
        private static Guid _regionId = new Guid("8c3c20d8-427c-4d10-aed5-9e304c0ea044");

        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                var region = session.Get<Region>(_regionId);
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
                _regionId,
                name);

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
