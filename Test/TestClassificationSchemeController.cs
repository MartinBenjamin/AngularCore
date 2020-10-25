using Autofac;
using CommonDomainObjects;
using Microsoft.AspNetCore.Mvc;
using NHibernate;
using NHibernate.Tool.hbm2ddl;
using NHibernateIntegration;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Web;
using Web.Controllers;

namespace Test
{

    [TestFixture]
    public class TestClassificationSchemeController
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
                .RegisterModule<NHibernateIntegration.Module>();
            builder
                .RegisterType<CommonDomainObjects.Mapping.ConventionModelMapperFactory>()
                .As<IModelMapperFactory>()
                .SingleInstance();
            builder
                .RegisterModule(new SQLiteInMemoryModule("Test"));
            builder
                .RegisterModule<Service.Module>();
            builder
                .RegisterModule<ControllerModule>();
            builder
                .RegisterModule<MapperModule>();

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

            Web.Model.ClassificationScheme classificationSchemeModel = null;
            using(var scope = _container.BeginLifetimeScope())
            {
                var controller = scope.Resolve<ClassificationSchemeController>();
                var actionResult = await controller.GetAsync(classificationScheme.Id);
                Assert.That(actionResult, Is.Not.Null);
                Assert.That(actionResult, Is.InstanceOf<OkObjectResult>());
                var okObjectResult = (OkObjectResult)actionResult;
                Assert.That(okObjectResult.Value, Is.InstanceOf<Web.Model.ClassificationScheme>());
                classificationSchemeModel = (Web.Model.ClassificationScheme)okObjectResult.Value;
                Assert.That(classificationSchemeModel.Id, Is.EqualTo(classificationScheme.Id));
            }

            var classificationSchemeClassifierMap = classificationScheme.Classifiers.ToMap(
                classificationSchemeModel.Classifiers);
            var classifierMap = classificationScheme.Classifiers.Select(classificationSchemeClassifier => classificationSchemeClassifier.Classifier).ToMap(
                classificationSchemeModel.Classifiers.Select(classificationSchemeClassifier => classificationSchemeClassifier.Classifier));
     
            foreach(var classificationSchemeClassifier in classificationScheme.Classifiers)
            {
                var classificationSchemeClassifierModel = classificationSchemeClassifierMap(classificationSchemeClassifier);
                Assert.That(
                    classificationSchemeClassifierModel.Classifier, Is.EqualTo(classifierMap(classificationSchemeClassifier.Classifier)));
                Assert.That(
                    classificationSchemeClassifierModel.Super,
                    Is.EqualTo(classificationSchemeClassifierMap(classificationSchemeClassifier.Super)));
                Assert.That(
                    classificationSchemeClassifierModel.Sub.ToHashSet().SetEquals(
                    classificationSchemeClassifier.Sub.Select(sub => classificationSchemeClassifierMap(sub))), Is.True);
            }

            Assert.That(classificationScheme.Classifiers.All(
                csc =>
                    classificationSchemeClassifierMap.PreservesStructure(
                        classificationSchemeClassifier => classificationSchemeClassifier.Super,
                        classificationSchemeClassifier => classificationSchemeClassifier.Super,
                        csc) &&
                    classificationSchemeClassifierMap.PreservesStructure(
                        classificationSchemeClassifier => classificationSchemeClassifier.Sub,
                        classificationSchemeClassifier => classificationSchemeClassifier.Sub,
                        csc) &&
                        classificationSchemeClassifierMap(csc).Classifier == classifierMap(csc.Classifier)), Is.True);
        }
    }
}
