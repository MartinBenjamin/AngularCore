using Autofac;
using CommonDomainObjects;
using NHibernate;
using NHibernate.Tool.hbm2ddl;
using NHibernateIntegration;
using NUnit.Framework;
using Service;
using System.IO;

namespace Test
{
    [TestFixture]
    public class TestCountryService: TestNamedService<string, Country, NamedFilters>
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

        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                //session.CreateQuery(@"delete from GeographicalArea country where country.Id = ""AA""").ExecuteUpdate();
                var country = session.Get<Country>("AA");
                if(country != null)
                    session.Delete(country);

                session.Flush();
            }
        }

        public override Country Create(
            string name
            )
        {
            var country = new Country(
                "AA",
                "AAA",
                null,
                0,
                name);

            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                session.Save(country);
                session.Flush();
            }

            return country;
        }
    }
}
