using Autofac;
using AutoMapper;
using CommonDomainObjects;
using NHibernate.Tool.hbm2ddl;
using NHibernateIntegration;
using NUnit.Framework;
using Service;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Test
{
    public abstract class TestNamedService2<TId, TNamed, TNamedModel, TNamedFilters>
        where TNamed: Named<TId>
        where TNamedModel: Service.Model.Named<TId>
        where TNamedFilters: NamedFilters, new ()
    {
        protected IContainer _container;

        public abstract TNamed Create(string name);

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
                .Register(c => new MapperConfiguration(cfg => cfg.AddProfile(new Service.Profile())).CreateMapper())
                .As<IMapper>()
                .SingleInstance();
            _container = builder.Build();

            File.Delete(SQLiteModule.DatabasePath);
            var schemaExport = new SchemaExport(_container.Resolve<IConfigurationFactory>().Build());
            schemaExport.Create(
                scriptAction => { },
                true);
        }

        [Test]
        public async Task Get()
        {
            var named = Create("ABC");
            Assert.That(named, Is.Not.Null);

            using(var scope = _container.BeginLifetimeScope())
            {
                var service = scope.Resolve<INamedService2<TId, TNamedModel, TNamedFilters>>();
                var retrieved = await service.GetAsync(named.Id);
                Assert.That(retrieved.Id, Is.EqualTo(named.Id));
            }
        }

        [TestCaseSource("NameFragmentTestCases")]
        public async Task FindForNameFragment(
            string name,
            string nameFragment,
            bool   contains
            )
        {
            var named = Create(name);
            Assert.That(named, Is.Not.Null);

            using(var scope = _container.BeginLifetimeScope())
            {
                var service = scope.Resolve<INamedService2<TId, TNamedModel, TNamedFilters>>();
                var result = await service.FindAsync(
                    new TNamedFilters
                    {
                        NameFragment = nameFragment
                    });
                Assert.That(result.Where(namedModel => namedModel.Id.Equals(named.Id)).Count(), Is.EqualTo(contains ? 1 : 0));
            }
        }

        public static IEnumerable<object[]> NameFragmentTestCases
        {
            get
            {
                var testCases = new List<object[]>();
                var name = "ABC";

                testCases.Add(
                    new object[]
                    {
                        name,
                        string.Empty,
                        true
                    });
                testCases.AddRange(
                    from fragment in name.Fragments()
                    select new object[]
                    {
                        name,
                        fragment,
                        true
                    });
                testCases.Add(
                    new object[]
                    {
                        name,
                        "X",
                        false
                    });
                testCases.AddRange(
                    from fragment in name.Fragments()
                    select new object[]
                    {
                        name,
                        fragment + 'X',
                        false
                    });
                testCases.AddRange(
                    from fragment in name.Fragments()
                    select new object[]
                    {
                        name,
                        'X' + fragment,
                        false
                    });
                var escaped = "%_";
                testCases.AddRange(
                    from n in new[] { "A" }.Concat(escaped.ToCharArray().Select(c => c.ToString()))
                    from fragment in escaped.ToCharArray().Select(c => c.ToString())
                    select new object[]
                    {
                        n,
                        fragment,
                        n.Contains(fragment)
                    });

                return testCases;
            }
        }
    }
}
