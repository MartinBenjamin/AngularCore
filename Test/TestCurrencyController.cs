using Autofac;
using Iso4217;
using NHibernate;
using NUnit.Framework;
using Service;
using System;
using Web.Controllers;

namespace Test
{
    [TestFixture]
    public class TestCurrencyController: TestNamedController<Guid, Currency, NamedFilters, Web.Model.Currency, NamedFilters, CurrencyController>
    {
        private static Guid _currencyId = new Guid("8c3c20d8-427c-4d10-aed5-9e304c0ea044");

        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                var currency = session.Get<Currency>(_currencyId);
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
                _currencyId,
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
