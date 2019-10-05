using Autofac;
using Data;
using NHibernate;
using NHibernate.Tool.hbm2ddl;
using NHibernateIntegration;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace Test
{
    [TestFixture]
    public class TestLoadCurrencies
    {
        protected IContainer _container;

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
                .RegisterType<SQLiteConfigurationFactory>()
                .As<IConfigurationFactory>()
                .SingleInstance();
            builder
                .RegisterModule(new SessionFactoryModule("Test"));
            builder
                .RegisterModule<Service.Module>();

            _container = builder.Build();

            File.Delete(SQLiteConfigurationFactory.DatabasePath);
            var schemaExport = new SchemaExport(_container.Resolve<IConfigurationFactory>().Build("Test"));
            schemaExport.Create(
                scriptAction => { },
                true);
        }

        [Test]
        public void Load()
        {
            var currencies = Loader.LoadCurrencies();
            Assert.That(currencies.Count, Is.GreaterThan(0));
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                currencies
                    .ToList()
                    .ForEach(currency => session.Save(currency));
                session.Flush();
            }
        }
    }
}
