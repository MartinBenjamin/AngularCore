using Autofac;
using CommonDomainObjects;
using Microsoft.AspNetCore.Mvc;
using NHibernate;
using NHibernate.Tool.hbm2ddl;
using NHibernateIntegration;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.IO;
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

            var classificationSchemeClassifierModelMap = classificationSchemeModel.Classifiers.ToDictionary(classificationSchemeClassifierModel => classificationSchemeClassifierModel.Id);
            Assert.That(classificationScheme.Classifiers.Select(classificationSchemeClassifier => classificationSchemeClassifier.Id)
                .ToHashSet().SetEquals(classificationSchemeClassifierModelMap.Keys));

            foreach(var classificationSchemeClassifier in classificationScheme.Classifiers)
            {
                var classificationSchemeClassifierModel = classificationSchemeClassifierModelMap[classificationSchemeClassifier.Id];
                Assert.That(classificationSchemeClassifierModel.Classifier.Id, Is.EqualTo(classificationSchemeClassifier.Classifier.Id));
                Assert.That(classificationSchemeClassifierModel.Super != null, Is.EqualTo(classificationSchemeClassifier.Super != null));
                if(classificationSchemeClassifierModel.Super != null)
                    Assert.That(classificationSchemeClassifierModel.Super.Id, Is.EqualTo(classificationSchemeClassifier.Super.Id));
                Assert.That(classificationSchemeClassifierModel.Sub.Select(sub => sub.Id).ToHashSet().SetEquals(
                    classificationSchemeClassifier.Sub.Select(sub => sub.Id)), Is.True);
            }

            var classifierModelMap = classificationSchemeModel.Classifiers.Select(
                classificationSchemeClassifierModel => classificationSchemeClassifierModel.Classifier).ToDictionary(classifierModel => classifierModel.Id);

            Assert.That(classificationScheme.Classifiers.PreservesStructure(
                classificationSchemeClassifier => classificationSchemeClassifier.Super,
                classificationSchemeClassifier => classificationSchemeClassifier != null ? classificationSchemeClassifierModelMap[classificationSchemeClassifier.Id] : null,
                classificationSchemeClassifierModel => classificationSchemeClassifierModel.Super), Is.True);

            Assert.That(classificationScheme.Classifiers.PreservesStructure(
                classificationSchemeClassifier => classificationSchemeClassifier.Sub,
                classificationSchemeClassifier => classificationSchemeClassifier != null ? classificationSchemeClassifierModelMap[classificationSchemeClassifier.Id] : null,
                classificationSchemeClassifierModel => classificationSchemeClassifierModel.Sub), Is.True);

            ValueTuple<
                Func<ClassificationSchemeClassifier, Web.Model.ClassificationSchemeClassifier>,
                Func<Classifier, Web.Model.Classifier>> map = (
                classificationSchemeClassifier => classificationSchemeClassifierModelMap[classificationSchemeClassifier.Id],
                classifier => classifierModelMap[classifier.Id]);

            Assert.That(classificationScheme.Classifiers.All(
                classificationSchemeClassifier => map.PreservesStructure(
                    csc => csc.Classifier,
                    csc => csc.Classifier,
                    classificationSchemeClassifier)), Is.True);
        }
    }
}
