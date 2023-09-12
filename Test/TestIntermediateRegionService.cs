using Autofac;
using NHibernate;
using NUnit.Framework;
using Service;
using System;
using UnsdM49;

namespace Test
{
    [TestFixture]
    public class TestIntermediateRegionService: TestNamedService<Guid, IntermediateRegion, NamedFilters>
    {
        private static Guid _intermediateRegionId = new Guid("8c3c20d8-427c-4d10-aed5-9e304c0ea044");

        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                var intermediateRegion = session.Get<IntermediateRegion>(_intermediateRegionId);
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
                _intermediateRegionId,
                name);

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
