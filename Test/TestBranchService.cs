using Autofac;
using NHibernate;
using NUnit.Framework;
using Organisations;
using Service;
using System;

namespace Test
{
    [TestFixture]
    public class TestBranchService: TestNamedService<Guid, Branch, NamedFilters>
    {
        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                foreach(var branch in session.CreateCriteria<Branch>().List<Branch>())
                    session.Delete(branch);

                session.Flush();
            }
        }

        public override Branch Create(
            string name
            )
        {
            var branch = new Branch(
                name,
                null,
                null);

            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                session.Save(branch);
                session.Flush();
            }

            return branch;
        }
    }
}
