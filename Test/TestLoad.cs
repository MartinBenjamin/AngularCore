﻿using Autofac;
using CommonDomainObjects;
using Data;
using FacilityAgreements;
using Iso3166._1;
using Iso3166._2;
using Iso4217;
using LifeCycles;
using Locations;
using Naics;
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

        [Test]
        public async Task Role()
        {
            var loader = _container.ResolveKeyed<IEtl>(typeof(Role));
            await loader.ExecuteAsync();
            using(var scope = _container.BeginLifetimeScope())
            {
                var csvExtractor = scope.Resolve<ICsvExtractor>();
                var extracted = await csvExtractor.ExtractAsync(loader.FileName);
                var service = scope.Resolve<INamedService<Guid, Role, NamedFilters>>();
                var loaded = (await service.FindAsync(new NamedFilters())).ToDictionary(role => role.Id);

                Assert.That(extracted.Count, Is.EqualTo(loaded.Keys.Count));

                foreach(var record in extracted)
                {
                    var id = new Guid(record[0]);
                    Assert.That(loaded.ContainsKey(id), Is.True);
                    var role = loaded[id];
                    Assert.That(role.Name, Is.EqualTo(record[1]));
                }
            }
        }

        [Test]
        public async Task FacilityFeeType()
        {
            var loader = _container.ResolveKeyed<IEtl>(typeof(FacilityFeeType));
            await loader.ExecuteAsync();
            using(var scope = _container.BeginLifetimeScope())
            {
                var csvExtractor = scope.Resolve<ICsvExtractor>();
                var extracted = await csvExtractor.ExtractAsync(loader.FileName);
                var service = scope.Resolve<INamedService<Guid, FacilityFeeType, NamedFilters>>();
                var loaded = (await service.FindAsync(new NamedFilters())).ToDictionary(facilityFeeType => facilityFeeType.Id);

                Assert.That(extracted.Count, Is.EqualTo(loaded.Keys.Count));

                foreach(var record in extracted)
                {
                    var id = new Guid(record[0]);
                    Assert.That(loaded.ContainsKey(id), Is.True);
                    var facilityFeeType = loaded[id];
                    Assert.That(facilityFeeType.Name, Is.EqualTo(record[1]));
                }
            }
        }

        [Test]
        public async Task Iso3166_1()
        {
            var loader = _container.ResolveKeyed<IEtl>(typeof(Country));
            await loader.ExecuteAsync();
            using(var scope = _container.BeginLifetimeScope())
            {
                var csvExtractor = scope.Resolve<ICsvExtractor>();
                var extracted = await csvExtractor.ExtractAsync(loader.FileName);
                var service = scope.Resolve<INamedService<string, Country, NamedFilters>>();
                var loaded = (await service.FindAsync(new NamedFilters())).ToDictionary(country => country.Id);

                Assert.That(loaded.Keys.Count, Is.EqualTo(extracted.Count));

                foreach(var record in extracted)
                {
                    Assert.That(loaded.ContainsKey(record[2]), Is.True);
                    var country = loaded[record[2]];
                    Assert.That(country.Id         , Is.EqualTo(record[2]           ));
                    Assert.That(country.Name       , Is.EqualTo(record[0]           ));
                    Assert.That(country.Alpha2Code , Is.EqualTo(record[2]           ));
                    Assert.That(country.Alpha3Code , Is.EqualTo(record[3]           ));
                    Assert.That(country.NumericCode, Is.EqualTo(int.Parse(record[4])));
                }

                var session = scope.Resolve<ISession>();
                var alpha2Identifiers = await session
                    .CreateCriteria<GeographicRegionIdentifier>()
                    .CreateCriteria("Scheme")
                        .Add(Expression.Eq("Id", new Guid("6f8c62fd-b57f-482b-9a3f-5c2ef9bb8882")))
                        .ListAsync<GeographicRegionIdentifier>();

                var alpha2CodeCountry = loaded.Values.ToDictionary(country => country.Alpha2Code);
                Assert.That(alpha2Identifiers.Count, Is.EqualTo(alpha2CodeCountry.Keys.Count));
                foreach(var alpha2Identifier in alpha2Identifiers)
                    Assert.That(alpha2Identifier.GeographicRegion, Is.EqualTo(alpha2CodeCountry[alpha2Identifier.Tag]));

                var alpha3Identifiers = await session
                    .CreateCriteria<GeographicRegionIdentifier>()
                    .CreateCriteria("Scheme")
                        .Add(Expression.Eq("Id", new Guid("17ffe52a-93f2-4755-835f-f29f1aec41a1")))
                        .ListAsync<GeographicRegionIdentifier>();

                var alpha3CodeCountry = loaded.Values.ToDictionary(country => country.Alpha3Code);
                Assert.That(alpha3Identifiers.Count, Is.EqualTo(alpha3CodeCountry.Keys.Count));
                foreach(var alpha3Identifier in alpha3Identifiers)
                    Assert.That(alpha3Identifier.GeographicRegion, Is.EqualTo(alpha3CodeCountry[alpha3Identifier.Tag]));

                var numericIdentifiers = await session
                    .CreateCriteria<GeographicRegionIdentifier>()
                    .CreateCriteria("Scheme")
                        .Add(Expression.Eq("Id", new Guid("d8829a3c-f631-40a7-9230-7caae0ad857b")))
                        .ListAsync<GeographicRegionIdentifier>();

                var numericCodeCountry = loaded.Values.ToDictionary(country => country.NumericCode);
                Assert.That(numericIdentifiers.Count, Is.EqualTo(numericCodeCountry.Keys.Count));
                foreach(var numericIdentifier in numericIdentifiers)
                    Assert.That(numericIdentifier.GeographicRegion, Is.EqualTo(numericCodeCountry[int.Parse(numericIdentifier.Tag)]));
            }
        }

        [Test]
        public async Task Iso3166_2()
        {
            await _container.ResolveKeyed<IEtl>(typeof(Country)).ExecuteAsync();
            var loaders = _container.ResolveKeyed<IEnumerable<IEtl>>(typeof(Subdivision));
            Assert.That(loaders.Count(), Is.EqualTo(5));
            int previous = 0;
            foreach(var loader in loaders)
            {
                await loader.ExecuteAsync();
                using(var scope = _container.BeginLifetimeScope())
                {
                    var csvExtractor = scope.Resolve<ICsvExtractor>();
                    var extracted = await csvExtractor.ExtractAsync(loader.FileName);
                    var service = scope.Resolve<INamedService<string, Subdivision, NamedFilters>>();
                    var loaded = (await service.FindAsync(new NamedFilters())).ToDictionary(subdivision => subdivision.Id);

                    Assert.That(loaded.Keys.Count - previous, Is.EqualTo(extracted.Count));
                    previous = loaded.Keys.Count;

                    foreach(var record in extracted)
                    {
                        Assert.That(loaded.ContainsKey(record[1]), Is.True);
                        var subdivision = loaded[record[1]];
                        Assert.That(subdivision.Id        , Is.EqualTo(record[1]                ));
                        Assert.That(subdivision.Name      , Is.EqualTo(record[2]                ));
                        Assert.That(subdivision.Country.Id, Is.EqualTo(record[1].Substring(0, 2)));
                        Assert.That(subdivision.Category  , Is.EqualTo(record[0]                ));

                        if(string.IsNullOrEmpty(record[6]))
                        {
                            Assert.That(subdivision.Region           , Is.EqualTo(subdivision.Country));
                            Assert.That(subdivision.ParentSubdivision, Is.Null                        );
                        }
                        else
                        {
                            Assert.That(subdivision.Region              , Is.EqualTo(subdivision.ParentSubdivision));
                            Assert.That(subdivision.ParentSubdivision.Id, Is.EqualTo(record[6])                    );
                        }

                        Assert.That(subdivision.Region.Subregions.Contains(subdivision), Is.True);
                        foreach(var subregion in subdivision.Subregions)
                            Assert.That(subregion.Region, Is.EqualTo(subdivision));
                    }
                }
            }
        }

        [Test]
        public async Task GeographicRegionHierarchy()
        {
            await _container.ResolveKeyed<IEtl>(typeof(Country)).ExecuteAsync();
            await _container.ResolveKeyed<IEnumerable<IEtl>>(typeof(Subdivision)).ForEachAsync(subdivisionLoader => subdivisionLoader.ExecuteAsync());

            var loader = _container.ResolveKeyed<IEtl>(typeof(GeographicRegionHierarchy));
            await loader.ExecuteAsync();

            using(var scope = _container.BeginLifetimeScope())
            {
                //var csvExtractor = scope.Resolve<ICsvExtractor>();
                //var extracted = await csvExtractor.ExtractAsync(loader.FileName);
                var service = scope.Resolve<IDomainObjectService<Guid, GeographicRegionHierarchy>>();
                var hierarchy = await service.GetAsync(new Guid("80bd57c5-7f3a-48d6-ba89-ad9ddaf12ebb"));

                Func<GeographicRegion, GeographicRegionHierarchyMember> map = geographicRegion => hierarchy[geographicRegion];

                Assert.That(hierarchy.Members.Count, Is.GreaterThan(0));
                Assert.That(hierarchy.Members
                    .Select(hierarchyMember => hierarchyMember.Member)
                    .Where(member => !member.Is<Country>())
                    .All(
                        gr => map.PreservesStructure(
                            geographicRegion => geographicRegion is GeographicSubregion geographicSubregion ? geographicSubregion.Region : null,
                            hierarchyMember  => hierarchyMember.Parent,
                            gr)), Is.True);

                Assert.That(hierarchy.Members
                    .Select(hierarchyMember => hierarchyMember.Member)
                    .All(
                        gr => map.PreservesStructure(
                            geographicRegion => geographicRegion.Subregions,
                            hierarchyMember  => hierarchyMember.Children.Where(child => !child.Member.Is<Country>()),
                            gr)), Is.True);
            }
        }

        [Test]
        public async Task Iso4217()
        {
            var loader = _container.ResolveKeyed<IEtl>(typeof(Currency));
            await loader.ExecuteAsync();
            using(var scope = _container.BeginLifetimeScope())
            {
                var csvExtractor = scope.Resolve<ICsvExtractor>();
                var extracted = (await csvExtractor.ExtractAsync(loader.FileName))
                    .Where(record => !string.IsNullOrEmpty(record[2]))
                    .ToList();
                var service = scope.Resolve<INamedService<string, Currency, NamedFilters>>();
                var loaded = (await service.FindAsync(new NamedFilters())).ToDictionary(currency => currency.Id);

                //Assert.That(loaded.Keys.Count, Is.EqualTo(extracted.Count));

                foreach(var record in extracted)
                {
                    Assert.That(loaded.ContainsKey(record[2]), Is.True);
                    var currency = loaded[record[2]];
                    Assert.That(currency.Id         , Is.EqualTo(record[2]           ));
                    Assert.That(currency.Name       , Is.EqualTo(record[1]           ));
                    Assert.That(currency.NumericCode, Is.EqualTo(int.Parse(record[3])));

                    if(record[4] == "N.A.")
                        Assert.That(currency.MinorUnit, Is.Null);

                    else
                        Assert.That(currency.MinorUnit, Is.EqualTo(int.Parse(record[4])));
                }
            }
        }

        [Test]
        public async Task Branch()
        {
            var loader = _container.ResolveKeyed<IEtl>(typeof(Branch));
            await loader.ExecuteAsync();
            using(var scope = _container.BeginLifetimeScope())
            {
                var csvExtractor = scope.Resolve<ICsvExtractor>();
                var extracted = await csvExtractor.ExtractAsync(loader.FileName);
                var session = scope.Resolve<ISession>();

                var loaded = (await session
                    .CreateCriteria<OrganisationIdentifier>()
                    .CreateCriteria("Scheme")
                        .Add(Expression.Eq("Id", new Guid("127c6a60-f00c-4cb2-8776-a64544aed5db")))
                        .ListAsync<OrganisationIdentifier>()).ToDictionary(identifier => identifier.Tag);

                Assert.That(loaded.Keys.Count, Is.EqualTo(extracted.Count));

                foreach(var record in extracted)
                {
                    Assert.That(loaded.ContainsKey(record[1]), Is.True);
                    var identifier = loaded[record[1]];
                    Assert.That(identifier.Organisation.Name, Is.EqualTo(record[0]));
                }
            }
        }

        [TestCase(typeof(DealStageLoader  ), "947b1353-bd48-4f36-a934-a03a942aaae2")]
        [TestCase(typeof(DealTypeLoader   ), "e28b89e1-97e4-4820-aabc-af31e6959888")]
        [TestCase(typeof(ExclusivityLoader), "f7c20b62-ffe8-4c20-86b4-e5c68ba2469d")]
        public async Task ClassificationScheme(
            Type   loaderType,
            string schemeId
            )
        {
            var loader = _container.ResolveKeyed<IEtl>(loaderType);
            Assert.That(loader, Is.Not.Null);
            await loader.ExecuteAsync();
            using(var scope = _container.BeginLifetimeScope())
            {
                var csvExtractor = scope.Resolve<ICsvExtractor>();
                var extracted = await csvExtractor.ExtractAsync(loader.FileName);
                var service = scope.Resolve<IDomainObjectService<Guid, ClassificationScheme>>();
                var loaded = (await service.GetAsync(new Guid(schemeId))).Classifiers.ToDictionary(
                    classificationSchemeClassifier => (classificationSchemeClassifier.Super?.Classifier.Id ?? Guid.Empty, classificationSchemeClassifier.Classifier.Name));

                Assert.That(extracted.Count, Is.GreaterThan(0));
                foreach(var record in extracted)
                {
                    Guid superId = string.IsNullOrEmpty(record[1]) ? Guid.Empty : new Guid(record[1]);
                    Assert.That(loaded.ContainsKey((superId, record[2])));
                    var classificationSchemeClassifier = loaded[(superId, record[2])];

                    if(!string.IsNullOrEmpty(record[0]))
                        Assert.That(classificationSchemeClassifier.Classifier.Id, Is.EqualTo(new Guid(record[0])));
                }
            }
        }

        [Test]
        public async Task Naics()
        {
            await _container.ResolveKeyed<IEtl>(typeof(NaicsLoader)).ExecuteAsync();

            using(var scope = _container.BeginLifetimeScope())
            {
                var csvExtractor = scope.Resolve<ICsvExtractor>();
                var extracted = await csvExtractor.ExtractAsync("NAICS2017.csv");
                var service = scope.Resolve<IDomainObjectService<Guid, ClassificationScheme>>();
                var loaded = (await service.GetAsync(new Guid("3833e9f7-ebab-4205-bfce-8464d0706f11"))).Classifiers.ToDictionary(
                    classificationSchemeClassifier => ((NaicsClassifier)classificationSchemeClassifier.Classifier).Code);

                Assert.That(extracted.Count, Is.GreaterThan(0));
                foreach(var record in extracted)
                {
                    Assert.That(loaded.ContainsKey(record[1]));
                    var classificationSchemeClassifier = loaded[record[1]];
                    Assert.That(classificationSchemeClassifier.Classifier.Name, Is.EqualTo(record[2]));

                    var super = classificationSchemeClassifier.Super;
                    if(super != null)
                        Assert.That(
                            Convert(((NaicsClassifier)super.Classifier).CodeRange).Contains(
                                Convert(((NaicsClassifier)classificationSchemeClassifier.Classifier).CodeRange)),
                            Is.True);
                }
            }
        }

        [Test]
        public async Task LifeCycles()
        {
            await _container.ResolveKeyed<IEnumerable<IEtl>>(typeof(ClassificationScheme)).ForEachAsync(classificationSchemeloader => classificationSchemeloader.ExecuteAsync());
            var loader = _container.ResolveKeyed<IEtl>(typeof(LifeCycle));
            await loader.ExecuteAsync();

            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                var csvExtractor = scope.Resolve<ICsvExtractor>();
                var records = await csvExtractor.ExtractAsync(loader.FileName);

                (
                    from record in records
                    group record by record[0] into recordsGroupedByLifeCycleId
                    select recordsGroupedByLifeCycleId
                ).ForEach(
                    async extracted =>
                    {
                        var lifeCycle = await session.GetAsync<LifeCycle>(new Guid(extracted.Key));
                        Assert.IsNotNull(lifeCycle);
                        Assert.That(lifeCycle.Stages.Select(stage => stage.Id).SequenceEqual(extracted.Select(record => new Guid(record[1]))), Is.True);
                    });
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
            await _container.ResolveKeyed<IEtl>(typeof(Role)).ExecuteAsync();
            await _container.ResolveKeyed<IEtl>(typeof(FacilityFeeType)).ExecuteAsync();
            await _container.ResolveKeyed<IEtl>(typeof(Country)).ExecuteAsync();
            await _container.ResolveKeyed<IEnumerable<IEtl>>(typeof(Subdivision)).ForEachAsync(loader => loader.ExecuteAsync());
            await _container.ResolveKeyed<IEtl>(typeof(GeographicRegionHierarchy)).ExecuteAsync();
            await _container.ResolveKeyed<IEtl>(typeof(Currency)).ExecuteAsync();
            await _container.ResolveKeyed<IEtl>(typeof(Branch)).ExecuteAsync();
            await _container.ResolveKeyed<IEnumerable<IEtl>>(typeof(ClassificationScheme)).ForEachAsync(loader => loader.ExecuteAsync());
            await _container.ResolveKeyed<IEtl>(typeof(LifeCycle)).ExecuteAsync();
            //await new LegalEntityLoader(
            //    _container.Resolve<ISessionFactory>(),
            //    100).LoadAsync();
        }

        private static Range<int> Convert(
            Range<int> range
            ) => new Range<int>(
                int.Parse(range.Start.ToString().PadRight(6, '0')),
                int.Parse(range.End.ToString().PadRight(6, '9')));
    }
}
