using Autofac;
using NHibernate;
using NUnit.Framework;
using Service;
using System;
using UnsdM49;

namespace Test
{
    [TestFixture]
    public class TestSubRegionService: TestNamedService<Guid, SubRegion, NamedFilters>
    {
        private static Guid _subRegionId = new Guid("8c3c20d8-427c-4d10-aed5-9e304c0ea044");

        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                var subRegion = session.Get<SubRegion>(_subRegionId);
                if(subRegion != null)
                    session.Delete(subRegion);

                session.Flush();
            }
        }

        public override SubRegion Create(
            string name
            )
        {
            var subRegion = new SubRegion(
                _subRegionId,
                name);

            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                session.Save(subRegion);
                session.Flush();
            }

            return subRegion;
        }
    }
}
