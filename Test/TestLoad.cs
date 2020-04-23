using Agents;
using Autofac;
using CommonDomainObjects;
using Data;
using Iso3166._1;
using Iso3166._2;
using Iso4217;
using Locations;
using NHibernate;
using NHibernate.Criterion;
using NHibernate.Tool.hbm2ddl;
using NHibernateIntegration;
using NUnit.Framework;
using Organisations;
using Service;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

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

        private async void Etl<TId, TNamed>() where TNamed: Named<TId>
        {
            var transformed = await _container.Resolve<IEtl<IEnumerable<TNamed>>>().ExecuteAsync();
            Assert.That(transformed.Count, Is.GreaterThan(0));

            using(var scope = _container.BeginLifetimeScope())
            {
                var service = scope.Resolve<INamedService<TId, TNamed, NamedFilters>>();
                var loaded = await service.FindAsync(new NamedFilters());
                Assert.That(
                    loaded.OrderBy(named => named.Id).SequenceEqual(transformed.OrderBy(named => named.Id)), Is.True);
            }
        }

        [Test]
        public async Task Iso3166_1()
        {
            Etl<string, Country>();
        }

        [Test]
        public async Task Iso3166_2()
        {
            await _container.Resolve<IEtl<IEnumerable<Country>>>().ExecuteAsync();
            Etl<string, Subdivision>();
        }

        [Test]
        public async Task GeographicRegionHierarchy()
        {
            await _container.Resolve<IEtl<IEnumerable<Country>>>().ExecuteAsync();
            await _container.Resolve<IEtl<IEnumerable<Subdivision>>>().ExecuteAsync();

            var hierarchy = await _container.Resolve<IEtl<GeographicRegionHierarchy>>().ExecuteAsync();
            Assert.That(hierarchy.Members.Count, Is.GreaterThan(0));
            Validate(hierarchy);

            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                await session
                    .CreateCriteria<GeographicRegion>()
                    .Fetch("Subregions")
                    .ListAsync<GeographicRegion>();
                await session
                    .CreateCriteria<GeographicRegionHierarchyMember>()
                    .Fetch("Children")
                    .ListAsync<GeographicRegionHierarchyMember>();
                var loadedHierarchy = await session
                    .CreateCriteria<GeographicRegionHierarchy>()
                    .Add(Expression.Eq("Id", hierarchy.Id))
                    .Fetch("Members")
                    .UniqueResultAsync<GeographicRegionHierarchy>();
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
            Etl<string, Currency>();
        }

        [Test]
        public async Task Branch()
        {
            var branches = await _container.Resolve<IEtl<IEnumerable<(Branch, Identifier)>>>().ExecuteAsync();
            Assert.That(branches.Count, Is.GreaterThan(0));

            using(var scope = _container.BeginLifetimeScope())
            {
                var service = scope.Resolve<INamedService<Guid, Branch, NamedFilters>>();
                var loaded = await service.FindAsync(new NamedFilters());
                Assert.That(
                    loaded.OrderBy(branch => branch.Id).SequenceEqual(branches.Select(t => t.Item1).OrderBy(branch => branch.Id)), Is.True);

                var session = scope.Resolve<ISession>();

                foreach(var (branch, identifier) in branches)
                    Assert.That(session.Get<Identifier>(identifier).Identifies, Is.EqualTo(branch));
            }
        }

        //[Test]
        public async Task Lei()
        {
            await _container.Resolve<IEtl<IEnumerable<Country>>>().ExecuteAsync();
            await new LegalEntityLoader(
                _container.Resolve<ISessionFactory>(),
                100).LoadAsync();
        }

        [Test]
        public async Task Load()
        {
            await _container.Resolve<IEtl<IEnumerable<Country>>>().ExecuteAsync();
            await _container.Resolve<IEtl<IEnumerable<Subdivision>>>().ExecuteAsync();
            await _container.Resolve<IEtl<GeographicRegionHierarchy>>().ExecuteAsync();
            await _container.Resolve<IEtl<IEnumerable<Currency>>>().ExecuteAsync();
            await _container.Resolve<IEtl<IEnumerable<(Branch, Identifier)>>>().ExecuteAsync();
            //await new LegalEntityLoader(
            //    _container.Resolve<ISessionFactory>(),
            //    100).LoadAsync();
        }

        private void Validate(
            GeographicRegionHierarchy hierarchy
            )
        {
            hierarchy
                .Members
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

                        foreach(var child in member.Member.Subregions)
                        {
                            var childHierachyMember = hierarchy[child];
                            Assert.That(childHierachyMember.Parent, Is.EqualTo(member));
                        }
                    });
        }
    }
}
