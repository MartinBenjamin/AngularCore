using Autofac;
using CommonDomainObjects;
using NHibernate;
using NHibernate.Mapping.ByCode;
using NHibernate.Tool.hbm2ddl;
using NHibernateIntegration;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Xml.Serialization;

namespace Test
{
    [TestFixture]
    public class TestPersistentTemporalObject
    {
        private const string _listenerName = "TestListener";
        private IContainer _container;

        public class ModelMapperFactory: CommonDomainObjects.Mapping.ConventionModelMapperFactory
        {
            protected override void Populate(
                ConventionModelMapper mapper
                )
            {
                base.Populate(mapper);

                mapper.AddMapping<CommonDomainObjects.Mapping.TemporalObject       <char>>();
                mapper.AddMapping<CommonDomainObjects.Mapping.TemporalObjectVersion<char>>();
            }
        }

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            var builder = new ContainerBuilder();
            builder
                .RegisterModule<NHibernateIntegration.Module>();
            builder
                .RegisterType<ModelMapperFactory>()
                .As<IModelMapperFactory>()
                .SingleInstance();
            builder
                .RegisterModule(new SQLiteModule("Test"));

            _container = builder.Build();
        }

        [SetUp]
        public void SetUp()
        {
            if(!Trace.Listeners.Cast<TraceListener>().Any(traceListener => traceListener.Name == _listenerName))
                Trace.Listeners.Add(
                    new TextWriterTraceListener(
                        TestContext.Out,
                        _listenerName));

            File.Delete(SQLiteModule.DatabasePath);
        }

        [Test]
        public void TestContainerRegistrations()
        {
            Assert.That(_container.ResolveNamed<ISessionFactory>("Test"), Is.Not.Null);
            Assert.That(_container.Resolve<ISessionFactory>()           , Is.Not.Null);
        }

        [Test]
        public void GenerateMapping()
        {
            var mapper = (ConventionModelMapper)_container.Resolve<IModelMapperFactory>().Build();
            var mapping = mapper.CompileMappingForAllExplicitlyAddedEntities();
            var xmlSerializer = new XmlSerializer(mapping.GetType());

            xmlSerializer.Serialize(
                TestContext.Out,
                mapping);
        }

        [Test]
        public void SchemaCreate()
        {
            var schemaExport = new SchemaExport(_container.Resolve<IConfigurationFactory>().Build());
            schemaExport.Create(
                TestContext.Out,
                true);
        }

        [Test]
        public void SchemaDrop()
        {
            var schemaExport = new SchemaExport(_container.Resolve<IConfigurationFactory>().Build());
            schemaExport.Drop(
                TestContext.Out,
                true);
        }

        [Test]
        public void Persist()
        {
            var schemaUpdate = new SchemaUpdate(_container.Resolve<IConfigurationFactory>().Build());
            schemaUpdate.Execute(
                scriptAction => Trace.WriteLine(scriptAction),
                true);

            var versions = "ABC";

            var temporalObject = new TemporalObject<char>(Guid.NewGuid());
            var charVersions = versions.Select(
                version => new TemporalObjectVersion<char>(
                    temporalObject,
                    version)).ToList();
            Assert.That(versions.SequenceEqual(temporalObject.Versions.Select(TemporalObjectVersion => TemporalObjectVersion.Object)), Is.True);
            foreach(var index in Enumerable.Range(0, temporalObject.Versions.Count))
                Assert.That(temporalObject.Versions[index].Number, Is.EqualTo(index + 1));

            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                session.Save(temporalObject);
                temporalObject.Versions.Select(session.Save).ToList();
                session.Flush();
            }

            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                temporalObject = session.Get<TemporalObject<char>>(temporalObject.Id);
                Assert.That(temporalObject, Is.Not.Null);
                Assert.That(versions.SequenceEqual(temporalObject.Versions.Select(TemporalObjectVersion => TemporalObjectVersion.Object)), Is.True);
            }
        }
    }
}
