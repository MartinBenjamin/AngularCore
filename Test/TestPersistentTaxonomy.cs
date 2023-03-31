using Autofac;
using CommonDomainObjects;
using NHibernate;
using NHibernate.Cfg.MappingSchema;
using NHibernate.Mapping.ByCode;
using NHibernate.Tool.hbm2ddl;
using NHibernateIntegration;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Xml.Serialization;

namespace Test
{
    [TestFixture]
    public class TestPersistentTaxonomy
    {
        private const string _listenerName = "TestListener";
        private IContainer _container;

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            var builder = new ContainerBuilder();
            builder
                .RegisterModule<CommonDomainObjects.Mapping.Module>();
            builder
                .Register<Action<ConventionModelMapper>>(
                    c => mapper =>
                    {
                        mapper.AddMapping<CommonDomainObjects.Mapping.Taxonomy    <char>>();
                        mapper.AddMapping<CommonDomainObjects.Mapping.TaxonomyTerm<char>>();
                    });
            builder
                .RegisterType<MappingFactory>()
                .As<IMappingFactory>()
                .WithParameter(
                    "types",
                    new[]
                    {
                        typeof(Taxonomy    <char>),
                        typeof(TaxonomyTerm<char>)
                    });
            builder
                .RegisterModule(new SQLiteInMemoryModule("Test"));

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
            if(!Trace.Listeners.Cast<TraceListener>().Any(traceListener => traceListener.Name == _listenerName))
                Trace.Listeners.Add(
                    new TextWriterTraceListener(
                        TestContext.Out,
                        _listenerName));
        }

        [Test]
        public void TestContainerRegistrations()
        {
            Assert.That(_container.ResolveNamed<ISessionFactory>("Test"), Is.Not.Null);
            Assert.That(_container.Resolve<ISessionFactory>()           , Is.Not.Null);
        }

        [Test]
        public void GenerateMappings()
        {
            var xmlSerializer = new XmlSerializer(typeof(HbmMapping));
            foreach(var mappingFactory in _container.Resolve<IEnumerable<IMappingFactory>>())
                xmlSerializer.Serialize(
                        TestContext.Out,
                        mappingFactory.Build());
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
            var taxonomy = new Taxonomy<char>(
                new Dictionary<char, IList<char>>
                {
                    {'A', new char[]{} },
                    {'B', new char[]{} },
                    {'C', new char[]{ 'B' } },
                    {'D', new char[]{ 'B' } },
                });

            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                session.Save(taxonomy);
                taxonomy.Visit(term => session.Save(term));
                session.Flush();
            }

            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                taxonomy = session.Get<Taxonomy<char>>(taxonomy.Id);
                Assert.That(taxonomy, Is.Not.Null);
                Assert.That(taxonomy['B'].Contains(taxonomy['C']), Is.True);
            }
        }

        [Test]
        public void Guid()
        {
            var generated = GuidUtility.Create(GuidUtility.UrlNamespace, "https://www.iso.org/obp/ui/#iso:code:3166:GB", 5);
            Assert.That(generated, Is.EqualTo(new Guid("96ee3ded-9c50-5306-bd73-098b9b96c45f")));
            TestContext.Out.WriteLine(generated);
        }
    }
}
