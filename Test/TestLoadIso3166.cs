using Autofac;
using CommonDomainObjects;
using Data;
using NHibernate;
using NHibernate.Tool.hbm2ddl;
using NHibernateIntegration;
using NUnit.Framework;
using Service;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Test
{
    [TestFixture]
    public class TestLoadIso3166
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
        public async Task Load()
        {
            var geographicalAreas = Loader.LoadIso3166();
            Assert.That(geographicalAreas.Members.Count, Is.GreaterThan(0));

            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                await session.SaveAsync(geographicalAreas);
                await geographicalAreas.VisitAsync(
                    async member =>
                    {
                        await session.SaveAsync(member.Member);
                        await session.SaveAsync(member);
                    });
                await session.FlushAsync();
            }

            using(var scope = _container.BeginLifetimeScope())
            {
                var loaded = await scope.Resolve<ISession>().GetAsync<GeographicalAreaHierarchy>(geographicalAreas.Id);
                Assert.That(loaded, Is.Not.Null);
                Assert.That(loaded.Members.Count, Is.EqualTo(geographicalAreas.Members.Count));
            }
        }
    }
}
