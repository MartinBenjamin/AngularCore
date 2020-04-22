using Autofac;
using NHibernate;
using NUnit.Framework;
using Roles;
using Service;
using System;

namespace Test
{
    [TestFixture]
    public class TestRoleService: TestNamedService<Guid, Role, NamedFilters>
    {
        private static Guid _roleId = new Guid("4310CCFF-B26C-4789-80DC-AE15E6E2DF67");

        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                var role = session.Get<Role>(_roleId);
                if(role != null)
                    session.Delete(role);

                session.Flush();
            }
        }

        public override Role Create(
            string name
            )
        {
            var role = new Role(
                _roleId,
                name);

            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                session.Save(role);
                session.Flush();
            }

            return role;
        }
    }
}
