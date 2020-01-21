using Autofac;
using NHibernate;
using NUnit.Framework;
using Service;
using UnsdM49;

namespace Test
{
    [TestFixture]
    public class TestGlobalService: TestNamedService<string, Global, NamedFilters>
    {
        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                var global = session.Get<Global>("001");
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
                "001",
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
