using Autofac;
using NHibernate;
using NUnit.Framework;
using Service;
using System;
using UnsdM49;

namespace Test
{
    [TestFixture]
    public class TestGlobalService: TestNamedService<Guid, Global, NamedFilters>
    {
        private static Guid _globalId = new Guid("8c3c20d8-427c-4d10-aed5-9e304c0ea044");

        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                var global = session.Get<Global>(_globalId);
                if(global != null)
                    session.Delete(global);

                session.Flush();
            }
        }

        public override Global Create(
            string name
            )
        {
            var global = new Global(
                _globalId,
                name);

            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                session.Save(global);
                session.Flush();
            }

            return global;
        }
    }
}
