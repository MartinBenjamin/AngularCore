using Autofac;
using Iso4217;
using NHibernate;
using NUnit.Framework;
using Service;

namespace Test
{
    [TestFixture]
    public class TestCurrencyService: TestNamedService<string, Currency, NamedFilters>
    {
        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                var currency = session.Get<Currency>("AAA");
                if(currency != null)
                    session.Delete(currency);

                session.Flush();
            }
        }

        public override Currency Create(
            string name
            )
        {
            var currency = new Currency(
                "AAA",
                0,
                name,
                null);

            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                session.Save(currency);
                session.Flush();
            }

            return currency;
        }
    }
}
