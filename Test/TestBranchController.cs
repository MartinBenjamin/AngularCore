using Autofac;
using NHibernate;
using NUnit.Framework;
using Organisations;
using Service;
using System;
using Web.Controllers;

namespace Test
{
    [TestFixture]
    public class TestBranchController: TestNamedController<Guid, Branch, NamedFilters, Web.Model.Branch, NamedFilters, BranchController>
    {
        private static Guid _branchId = new Guid("8C3C20D8-427C-4D10-AED5-9E304C0EA044");

        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                var country = session.Get<Branch>(_branchId);
                if(country != null)
                    session.Delete(country);

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
