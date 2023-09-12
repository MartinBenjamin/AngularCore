using Autofac;
using CommonDomainObjects;
using Iso3166._2;
using Locations;
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
    class TestGeographicRegionHierarchyService
    {
        private static readonly IDictionary<char, IList<char>> _parent = new Dictionary<char, IList<char>>
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
                    "delete GeographicRegionHierarchyMember",
                    "delete GeographicRegion",
                    "delete GeographicRegionHierarchy"
                }.ForEach(update => session.CreateQuery(update).ExecuteUpdate());
            }
        }

        [Test]
        public async Task Get()
        {
            var parent = _parent.Select(
                vertex => (GeographicRegion)new Subdivision(
                    Guid.NewGuid(),
                    vertex.ToString(),
                    vertex.ToString(),
                    null,
                    null,
                    null));

            var geographicRegionHierarchy = new GeographicRegionHierarchy(parent);
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                await session.SaveAsync(geographicRegionHierarchy);
                await geographicRegionHierarchy.VisitAsync(
                    async geographicRegionHierarchyMember =>
                    {
                        await session.SaveAsync(geographicRegionHierarchyMember.Member);
                        await session.SaveAsync(geographicRegionHierarchyMember);
                    },
                    null);
                await session.FlushAsync();
            }

            GeographicRegionHierarchy retrieved = null;
            using(var scope = _container.BeginLifetimeScope())
                retrieved = await scope.Resolve<IDomainObjectService<Guid, GeographicRegionHierarchy>>().GetAsync(geographicRegionHierarchy.Id);

            Assert.That(retrieved, Is.Not.Null);
            Assert.That(retrieved, Is.EqualTo(geographicRegionHierarchy));
            Assert.That(retrieved.Members.ToHashSet().SetEquals(geographicRegionHierarchy.Members));

            var map = geographicRegionHierarchy.Members.ToDictionary(classificationSchemeClassifier => classificationSchemeClassifier.Id);

            foreach(var retrievedGeographicRegionHierarchyMember in retrieved.Members)
            {
                var classificationSchemeClassifier = map[retrievedGeographicRegionHierarchyMember.Id];
                Assert.That(retrievedGeographicRegionHierarchyMember       , Is.EqualTo(classificationSchemeClassifier       ));
                Assert.That(retrievedGeographicRegionHierarchyMember.Member, Is.EqualTo(classificationSchemeClassifier.Member));
                Assert.That(retrievedGeographicRegionHierarchyMember.Parent, Is.EqualTo(classificationSchemeClassifier.Parent));
                Assert.That(retrievedGeographicRegionHierarchyMember.Children.ToHashSet().SetEquals(classificationSchemeClassifier.Children));
            }
        }
    }
}
