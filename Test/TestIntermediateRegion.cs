using Autofac;
using NHibernate;
using NHibernate.Tool.hbm2ddl;
using NHibernateIntegration;
using NUnit.Framework;
using Service;
using System.IO;
using UnsdM49;

namespace Test
{
    [TestFixture]
    public class TestIntermediateRegionService: TestNamedService<string, IntermediateRegion, NamedFilters>
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
                .RegisterModule<SQLiteModule>();
            builder
                .RegisterModule(new SessionFactoryModule("Test"));
            builder
                .RegisterModule<Service.Module>();

            _container = builder.Build();

            File.Delete(SQLiteModule.DatabasePath);
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
                var intermediateRegion = session.Get<IntermediateRegion>("002");
                if(intermediateRegion != null)
                    session.Delete(intermediateRegion);

                session.Flush();
            }
        }

        public override IntermediateRegion Create(
            string name
            )
        {
            var intermediateRegion = new IntermediateRegion(
                "002",
                name,
                null);

            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                session.Save(intermediateRegion);
                session.Flush();
            }

            return intermediateRegion;
        }
    }
}
