using Autofac;
using CommonDomainObjects;
using Iso3166._2;
using Locations;
using Microsoft.AspNetCore.Mvc;
using NHibernate;
using NHibernate.Tool.hbm2ddl;
using NHibernateIntegration;
using NUnit.Framework;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Web;
using Web.Controllers;

namespace Test
{

    [TestFixture]
    class TestGeographicRegionHierarchyController
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
                session.CreateQuery("delete ClassificationSchemeClassifier").ExecuteUpdate();
                session.CreateQuery("delete CommonDomainObjects.Classifier").ExecuteUpdate();
                session.CreateQuery("delete ClassificationScheme").ExecuteUpdate();
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

            Web.Model.GeographicRegionHierarchy geographicRegionHierarchyModel = null;
            using(var scope = _container.BeginLifetimeScope())
            {
                var controller = scope.Resolve<GeographicRegionHierarchyController>();
                var actionResult = await controller.GetAsync(geographicRegionHierarchy.Id);
                Assert.That(actionResult, Is.Not.Null);
                Assert.That(actionResult, Is.InstanceOf<OkObjectResult>());
                var okObjectResult = (OkObjectResult)actionResult;
                Assert.That(okObjectResult.Value, Is.InstanceOf<Web.Model.GeographicRegionHierarchy>());
                geographicRegionHierarchyModel = (Web.Model.GeographicRegionHierarchy)okObjectResult.Value;
                Assert.That(geographicRegionHierarchyModel.Id, Is.EqualTo(geographicRegionHierarchy.Id));
            }

            var geographicRegionHierarchyMemberMap = (
                from domainObject in geographicRegionHierarchy.Members
                join domainObjectModel in geographicRegionHierarchyModel.Members
                on domainObject.Id equals domainObjectModel.Id
                select
                (
                    domainObject,
                    domainObjectModel
                )).ToDictionary(
                    tuple => tuple.domainObject,
                    tuple => tuple.domainObjectModel);

            var geographicRegionMap = (
                from domainObject in geographicRegionHierarchy.Members.Select(geographicRegionHierarchyMember => geographicRegionHierarchyMember.Member)
                join domainObjectModel in geographicRegionHierarchyModel.Members.Select(geographicRegionHierarchyMember => geographicRegionHierarchyMember.Member)
                on domainObject.Id equals domainObjectModel.Id
                select
                (
                    domainObject,
                    domainObjectModel
                )).ToDictionary(
                    tuple => tuple.domainObject,
                    tuple => tuple.domainObjectModel);
            
            foreach(var geographicRegionHierarchyMember in geographicRegionHierarchy.Members)
            {
                var geographicRegionHierarchyMemberModel = geographicRegionHierarchyMemberMap[geographicRegionHierarchyMember];
                Assert.That(
                    geographicRegionHierarchyMemberModel.Member, Is.EqualTo(geographicRegionMap[geographicRegionHierarchyMember.Member]));
                Assert.That(geographicRegionHierarchyMemberModel.Parent != null, Is.EqualTo(geographicRegionHierarchyMember.Parent != null));
                if(geographicRegionHierarchyMemberModel.Parent != null)
                    Assert.That(geographicRegionHierarchyMemberModel.Parent,
                    Is.EqualTo(geographicRegionHierarchyMemberMap[geographicRegionHierarchyMember.Parent]));
                Assert.That(geographicRegionHierarchyMemberModel.Children.ToHashSet().SetEquals(
                    geographicRegionHierarchyMember.Children.Select(child => geographicRegionHierarchyMemberMap[child])), Is.True);
            }
        }
    }
}
