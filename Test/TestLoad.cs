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
using Roles;
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

        private async Task Etl<TId, TNamed>() where TNamed: Named<TId>
        {
            var transformed = await _container.Resolve<IEtl<IEnumerable<TNamed>>>().ExecuteAsync();
            Assert.That(transformed.Count, Is.GreaterThan(0));

            using(var scope = _container.BeginLifetimeScope())
            {
                var service = scope.Resolve<INamedService<TId, TNamed, NamedFilters>>();
                var loaded = await service.FindAsync(new NamedFilters());
                Assert.That(loaded.ToHashSet().SetEquals(transformed), Is.True);
            }
        }

        [Test]
        public async Task Role()
        {
            await Etl<Guid, Role>();
        }

        [Test]
        public async Task Iso3166_1()
        {
            await Etl<string, Country>();
        }

        [Test]
        public async Task Iso3166_2()
        {
            await _container.Resolve<IEtl<IEnumerable<Country>>>().ExecuteAsync();
            await Etl<string, Subdivision>();
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
                session
                    .CreateCriteria<GeographicRegion>()
                    .Fetch("Subregions")
                    .Future<GeographicRegion>();
                session
                    .CreateCriteria<GeographicRegionHierarchyMember>()
                    .Fetch("Children")
                    .Future<GeographicRegionHierarchyMember>();
                var loadedHierarchy = await session
                    .CreateCriteria<GeographicRegionHierarchy>()
                    .Add(Expression.Eq("Id", hierarchy.Id))
                    .Fetch("Members")
                    .FutureValue<GeographicRegionHierarchy>().GetValueAsync();
                Assert.That(loadedHierarchy, Is.Not.Null);
                Validate(loadedHierarchy);

                var loadedMemberMap = loadedHierarchy.Members.ToDictionary(member => member.Id);
                foreach(var member in hierarchy.Members)
                {
                    Assert.That(loadedMemberMap.ContainsKey(member.Id));
                    var loadedMember = loadedMemberMap[member.Id];
                    Assert.That(loadedMember.Member, Is.EqualTo(member.Member));
                    Assert.That(loadedMember.Parent, Is.EqualTo(member.Parent));
                    Assert.That(loadedMember.Children.ToHashSet().SetEquals(member.Children));
                }
            }
        }

        [Test]
        public async Task Iso4217()
        {
            await Etl<string, Currency>();
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
                Assert.That(loaded.ToHashSet().SetEquals(branches.Select(t => t.Item1)), Is.True);

                var session = scope.Resolve<ISession>();

                foreach(var (branch, identifier) in branches)
                    Assert.That(session.Get<Identifier>(identifier).Identifies, Is.EqualTo(branch));
            }
        }

        [Test]
        public async Task Exclusivity()
        {
            var classificationScheme = await _container.Resolve<IEtl<ClassificationScheme>>().ExecuteAsync();

            using(var scope = _container.BeginLifetimeScope())
            {
                var service = scope.Resolve<IDomainObjectService<Guid, ClassificationScheme>>();
                var loaded = await service.GetAsync(classificationScheme.Id);
                Assert.That(loaded, Is.Not.Null);
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
            await _container.Resolve<IEtl<IEnumerable<Role>>>().ExecuteAsync();
            await _container.Resolve<IEtl<IEnumerable<Country>>>().ExecuteAsync();
            await _container.Resolve<IEtl<IEnumerable<Subdivision>>>().ExecuteAsync();
            await _container.Resolve<IEtl<GeographicRegionHierarchy>>().ExecuteAsync();
            await _container.Resolve<IEtl<IEnumerable<Currency>>>().ExecuteAsync();
            await _container.Resolve<IEtl<IEnumerable<(Branch, Identifier)>>>().ExecuteAsync();
            await _container.Resolve<IEtl<ClassificationScheme>>().ExecuteAsync();
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
                            Assert.That(member.Parent.Children.Contains(member));
                            var geographicSubregion = member.Member.As<GeographicSubregion>();
                            if(geographicSubregion != null)
                            {
                                Assert.That(member.Parent.Member, Is.EqualTo(geographicSubregion.Region));
                                Assert.That(member.Parent.Member.Subregions.Contains(member.Member));
                            }
                        }

                        foreach(var child in member.Children)
                            Assert.That(child.Parent, Is.EqualTo(member));

                        foreach(var child in member.Member.Subregions)
                        {
                            var childHierachyMember = hierarchy[child];
                            Assert.That(childHierachyMember.Parent, Is.EqualTo(member));
                        }
                    });
        }
    }
}
