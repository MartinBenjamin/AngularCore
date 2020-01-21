using Autofac;
using NHibernate;
using NUnit.Framework;
using Service;
using UnsdM49;

namespace Test
{
    [TestFixture]
    public class TestSubRegionService: TestNamedService<string, SubRegion, NamedFilters>
    {
        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                var subRegion = session.Get<SubRegion>("002");
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
                "002",
                name,
                null);

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
