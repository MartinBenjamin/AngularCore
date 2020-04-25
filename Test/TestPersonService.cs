using Autofac;
using NHibernate;
using NUnit.Framework;
using People;
using Service;
using System;

namespace Test
{
    [TestFixture]
    public class TestPersonService: TestNamedService<Guid, Person, NamedFilters>
    {
        private static Guid _personId = new Guid("f8d19ec6-9c5f-4ba3-8668-7f68be02d29b");

        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                var person = session.Get<Person>(_personId);
                if(person != null)
                    session.Delete(person);

                session.Flush();
            }
        }

        public override Person Create(
            string name
            )
        {
            var person = new Person(
                _personId,
                new PersonNameComponents(
                    name,
                    string.Empty));

            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                session.Save(person);
                session.Flush();
            }

            return person;
        }
    }
}
