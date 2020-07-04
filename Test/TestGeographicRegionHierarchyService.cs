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
using System.IO;
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
                session.CreateQuery("delete GeographicRegionHierarchyMember").ExecuteUpdate();
                session.CreateQuery("delete GeographicRegion"               ).ExecuteUpdate();
                session.CreateQuery("delete GeographicRegionHierarchy"      ).ExecuteUpdate();
            }
        }

        [Test]
        public async Task Get()
        {
            var parent = _parent.Select(
                vertex => (GeographicRegion)new Subdivision(
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
