using Autofac;
using CommonDomainObjects;
using Data;
using Iso4217;
using Locations;
using NHibernate;
using NHibernate.Tool.hbm2ddl;
using NHibernateIntegration;
using NUnit.Framework;
using Service;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;
using System.Xml;

namespace Test
{
    [TestFixture]
    public class TestLoad
    {
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
                .RegisterModule<Data.Module>();
            builder
                .RegisterModule<Service.Module>();

            _container = builder.Build();
        }

        [SetUp]
        public void SetUp()
        {
            File.Delete(SQLiteModule.DatabasePath);
            var schemaExport = new SchemaExport(_container.Resolve<IConfigurationFactory>().Build());
            schemaExport.Create(
                scriptAction => { },
                true);
        }

        [Test]
        public async Task Iso3166()
        {
            var hierarchy = await _container.Resolve<IEtl<GeographicRegionHierarchy>>().ExecuteAsync();
            Assert.That(hierarchy.Members.Count, Is.GreaterThan(0));
            Validate(hierarchy);

            using(var scope = _container.BeginLifetimeScope())
            {
                var loadedHierarchy = await scope.Resolve<ISession>().GetAsync<GeographicRegionHierarchy>(hierarchy.Id);
                Assert.That(loadedHierarchy, Is.Not.Null);
                Validate(loadedHierarchy);

                var loadedMemberMap = loadedHierarchy.Members.ToDictionary(member => member.Id);
                foreach(var member in hierarchy.Members)
                {
                    Assert.That(loadedMemberMap.ContainsKey(member.Id));
                    var loadedMember = loadedMemberMap[member.Id];
                    Assert.That(loadedMember.Member, Is.EqualTo(member.Member));
                    Assert.That(loadedMember.Parent, Is.EqualTo(member.Parent));
                }
            }
        }

        [Test]
        public async Task Iso4217()
        {
            var currencies = await _container.Resolve<IEtl<IEnumerable<Currency>>>().ExecuteAsync();
            Assert.That(currencies.Count, Is.GreaterThan(0));

            using(var scope = _container.BeginLifetimeScope())
            {
                var service = scope.Resolve<INamedService<string, Currency, NamedFilters>>();
                var loaded = await service.FindAsync(new NamedFilters());
                Assert.That(
                    loaded.OrderBy(currency => currency.Id).SequenceEqual(currencies.OrderBy(currency => currency.Id)), Is.True);
            }
        }

        //[Test]
        public async Task Lei()
        {
            using(var zipFile = new FileStream(
                @"C:\Users\Martin\Downloads\20200118-gleif-concatenated-file-lei2.xml.5e22c9ddd878a.zip",
                FileMode.Open))
                using(var archive = new ZipArchive(zipFile, ZipArchiveMode.Read))
                {
                    Assert.That(archive.Entries.Count, Is.EqualTo(1));
                    using(var stream = archive.Entries[0].Open())
                        using(var xmlReader = XmlReader.Create(
                            stream,
                            new XmlReaderSettings
                            {
                                Async = true
                            }))
                        {
                            Assert.That(xmlReader, Is.Not.Null);
                            var leiNamespace = "http://www.gleif.org/data/schema/leidata/2016";
                            xmlReader.MoveToContent();
                            xmlReader.ReadToDescendant("LEIRecord", leiNamespace);
                            xmlReader.ReadToDescendant("LEI", leiNamespace);
                            var lei = xmlReader.ReadElementContentAsString();
                            xmlReader.ReadToFollowing("LegalName", leiNamespace);
                            var legalName = xmlReader.ReadElementContentAsString();
                        }
                }
        }

        [Test]
        public async Task Load()
        {
            await _container.Resolve<IEtl<GeographicRegionHierarchy>>().ExecuteAsync();
            await _container.Resolve<IEtl<IEnumerable<Currency>>>().ExecuteAsync();
        }

        private void Validate(
            GeographicRegionHierarchy hierarchy
            )
        {
            hierarchy
                .Members
                .ToList()
                .ForEach(
                    member =>
                    {
                        if(member.Parent != null)
                        {
                            Assert.That(member.Member.Is<GeographicSubregion>());
                            Assert.That(member.Parent.Children.Contains(member));
                            Assert.That(member.Parent.Member, Is.EqualTo(member.Member.As<GeographicSubregion>().Region));
                            Assert.That(member.Parent.Member.Subregions.Contains(member.Member));
                        }

                        foreach(var child in member.Children)
                        {
                            Assert.That(child.Member.Is<GeographicSubregion>());
                            Assert.That(child.Parent, Is.EqualTo(member));
                            Assert.That(child.Member.As<GeographicSubregion>().Region, Is.EqualTo(member.Member));
                            Assert.That(member.Member.Subregions.Contains(child.Member));
                        }
                    });
        }
    }
}
