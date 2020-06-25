using Autofac;
using CommonDomainObjects;
using NHibernate;
using NHibernate.Tool.hbm2ddl;
using NHibernateIntegration;
using NUnit.Framework;
using Service;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace Test
{
    [TestFixture]

    public class TestClassificationSchemeService
    {
        private static readonly IDictionary<char, IList<char>> _super = new Dictionary<char, IList<char>>
        {
            { 'A', new char[]{} },
            { 'B', new char[]{} },
            { 'C', new char[]{ 'B' } },
            { 'D', new char[]{ 'B' } },
        };

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
                .RegisterModule(new SQLiteModule("Test"));
            builder
                .RegisterModule<Service.Module>();

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
                session.CreateQuery("delete ClassificationSchemeClass").ExecuteUpdate();
                session.CreateQuery("delete CommonDomainObjects.Class").ExecuteUpdate();
                session.CreateQuery("delete ClassificationScheme"     ).ExecuteUpdate();
            }
        }

        [Test]
        public async Task Get()
        {
            var super = _super.Select(
                vertex => new Class(
                    Guid.NewGuid(),
                    vertex.ToString()));

            var classificationScheme = new ClassificationScheme(super);
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                await session.SaveAsync(classificationScheme);
                await classificationScheme.VisitAsync(
                    async classificationSchemeClass =>
                    {
                        await session.SaveAsync(classificationSchemeClass.Class);
                        await session.SaveAsync(classificationSchemeClass);
                    },
                    null);
                await session.FlushAsync();
            }

            ClassificationScheme retrieved = null;
            using(var scope = _container.BeginLifetimeScope())
                retrieved = await scope.Resolve<IDomainObjectService<Guid, ClassificationScheme>>().GetAsync(classificationScheme.Id);

            Assert.That(retrieved, Is.Not.Null);
            Assert.That(retrieved, Is.EqualTo(classificationScheme));

            foreach(var retrievedClassificationSchemeClass in retrieved.Classes)
            {
                var classificationSchemeClass = classificationScheme[retrievedClassificationSchemeClass.Class];
                Assert.That(classificationSchemeClass, Is.Not.Null);
                Assert.That(retrievedClassificationSchemeClass      , Is.EqualTo(classificationSchemeClass      ));
                Assert.That(retrievedClassificationSchemeClass.Super, Is.EqualTo(classificationSchemeClass.Super));
            }
        }
    }
}
