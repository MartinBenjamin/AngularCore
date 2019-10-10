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
        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            var builder = new ContainerBuilder();
            builder
                .RegisterModule<NHibernateIntegration.Module>();
            builder
                .RegisterType<CommonDomainObjects.Mapping.ConventionModelMapperFactory>()
                .As<IModelMapperFactory>()
                .SingleInstance();
            builder
                .RegisterModule(new SQLiteModule("Test"));
            builder
                .RegisterModule<Service.Module>();
            builder
                .RegisterModule<ControllerModule>();
            builder
                .RegisterModule<MapperModule>();

            _container = builder.Build();

            File.Delete(SQLiteModule.DatabasePath);
            var schemaExport = new SchemaExport(_container.Resolve<IConfigurationFactory>().Build());
            schemaExport.Create(
                scriptAction => { },
                true);
        }

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
