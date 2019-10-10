using Autofac;
using Iso4217;
using NHibernate;
using NHibernate.Tool.hbm2ddl;
using NHibernateIntegration;
using NUnit.Framework;
using Service;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using Web;
using Web.Controllers;

namespace Test
{
    [TestFixture]
    public class TestCurrencyController: TestNamedController<string, Currency, NamedFilters, Web.Model.Currency, NamedFilters, CurrencyController>
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
