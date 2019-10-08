using Autofac;
using CommonDomainObjects;
using NHibernate;
using NHibernate.Mapping.ByCode;
using NHibernate.Tool.hbm2ddl;
using NHibernateIntegration;
using NUnit.Framework;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Xml.Serialization;

namespace Test
{
    [TestFixture]
    public class TestPersistence
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

                mapper.AddMapping(new CommonDomainObjects.Mapping.Taxonomy<char>("Char"));
                mapper.AddMapping(new CommonDomainObjects.Mapping.TaxonomyTerm<char>("Char"));
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
        public void Mapper()
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
    }
}
