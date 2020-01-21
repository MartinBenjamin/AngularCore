using Autofac;
using NHibernate;
using NUnit.Framework;
using Service;
using UnsdM49;

namespace Test
{
    [TestFixture]
    public class TestIntermediateRegionService: TestNamedService<string, IntermediateRegion, NamedFilters>
    {
        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                var intermediateRegion = session.Get<IntermediateRegion>("002");
                if(intermediateRegion != null)
                    session.Delete(intermediateRegion);

                session.Flush();
            }
        }

        public override IntermediateRegion Create(
            string name
            )
        {
            var intermediateRegion = new IntermediateRegion(
                "002",
                name,
                null);

            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                session.Save(intermediateRegion);
                session.Flush();
            }

            return intermediateRegion;
        }
    }
}
