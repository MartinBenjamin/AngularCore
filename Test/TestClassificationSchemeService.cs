using Autofac;
using CommonDomainObjects;
using NHibernate;
using NHibernate.Tool.hbm2ddl;
using NHibernateIntegration;
using NUnit.Framework;
using Service;
using System;
using System.Collections.Generic;
using System.Linq;
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

        private IContainer _container;

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            var builder = new ContainerBuilder();
            builder
                .RegisterModule<CommonDomainObjects.Mapping.Module>();
            builder
                .RegisterModule(new SQLiteInMemoryModule("Test"));
            builder
                .RegisterModule<Service.Module>();

            _container = builder.Build();

            new SchemaExport(_container.Resolve<IConfigurationFactory>().Build()).Execute(
                false,
                true,
                false,
                _container.Resolve<ISession>().Connection, // Creates in memory database.
                null);
        }

        [OneTimeTearDown]
        public void OneTimeTearDown()
        {
            _container.Dispose();
        }

        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                new[]
                {
                    "delete ClassificationSchemeClassifier",
                    "delete Classifier",
                    "delete ClassificationScheme"
                }.ForEach(update => session.CreateQuery(update).ExecuteUpdate());
            }
        }

        [Test]
        public async Task Get()
        {
            var super = _super.Select(
                vertex => new Classifier(
                    Guid.NewGuid(),
                    vertex.ToString()));

            var classificationScheme = new ClassificationScheme(super);
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                await session.SaveAsync(classificationScheme);
                await classificationScheme.VisitAsync(
                    async classificationSchemeClassifier =>
                    {
                        await session.SaveAsync(classificationSchemeClassifier.Classifier);
                        await session.SaveAsync(classificationSchemeClassifier);
                    },
                    null);
                await session.FlushAsync();
            }

            ClassificationScheme retrieved = null;
            using(var scope = _container.BeginLifetimeScope())
                retrieved = await scope.Resolve<IDomainObjectService<Guid, ClassificationScheme>>().GetAsync(classificationScheme.Id);

            Assert.That(retrieved, Is.Not.Null);
            Assert.That(retrieved, Is.EqualTo(classificationScheme));
            Assert.That(retrieved.Classifiers.ToHashSet().SetEquals(classificationScheme.Classifiers));

            var map = classificationScheme.Classifiers.ToDictionary(classificationSchemeClassifier => classificationSchemeClassifier.Id);

            foreach(var retrievedClassificationSchemeClassifier in retrieved.Classifiers)
            {
                var classificationSchemeClassifier = map[retrievedClassificationSchemeClassifier.Id];
                Assert.That(retrievedClassificationSchemeClassifier           , Is.EqualTo(classificationSchemeClassifier           ));
                Assert.That(retrievedClassificationSchemeClassifier.Classifier, Is.EqualTo(classificationSchemeClassifier.Classifier));
                Assert.That(retrievedClassificationSchemeClassifier.Super     , Is.EqualTo(classificationSchemeClassifier.Super     ));
                Assert.That(retrievedClassificationSchemeClassifier.Sub.ToHashSet().SetEquals(classificationSchemeClassifier.Sub));
            }
        }
    }
}
