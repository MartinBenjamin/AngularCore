using Autofac;
using AutoMapper;
using CommonDomainObjects;
using Microsoft.AspNetCore.Mvc;
using NHibernate;
using NHibernate.Tool.hbm2ddl;
using NHibernateIntegration;
using NUnit.Framework;
using Service;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Web;
using Web.Controllers;

namespace Test
{
    public abstract class TestNamedController<TId, TNamed, TNamedFilters, TNamedModel, TNamedFiltersModel, TNamedController>
        where TNamed : Named<TId>
        where TNamedFilters : NamedFilters, new()
        where TNamedModel: Web.Model.Named<TId>
        where TNamedController: NamedController<TId, TNamed, TNamedFilters, TNamedModel, TNamedFiltersModel>
    {
        protected IContainer _container;

        public abstract TNamed Create(string name);

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            var builder = new ContainerBuilder();
            builder
                .RegisterModule<CommonDomainObjects.Mapping.Module>();
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

        [Test]
        public async Task Get()
        {
            var named = Create("ABC");
            Assert.That(named, Is.Not.Null);

            using(var scope = _container.BeginLifetimeScope())
            {
                var controller = scope.Resolve<TNamedController>();
                var actionResult = await controller.GetAsync(named.Id);
                Assert.That(actionResult, Is.Not.Null);
                Assert.That(actionResult, Is.InstanceOf<OkObjectResult>());
                var okObjectResult = (OkObjectResult)actionResult;
                Assert.That(okObjectResult.Value, Is.InstanceOf<TNamedModel>());
                var namedModel = (TNamedModel)okObjectResult.Value;
                Assert.That(namedModel.Id, Is.EqualTo(named.Id));
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
                var controller = scope.Resolve<TNamedController>();
                var actionResult = await controller.FindAsync(
                    new TNamedFilters
                    {
                        NameFragment = nameFragment
                    });
                Assert.That(actionResult, Is.Not.Null);
                Assert.That(actionResult, Is.InstanceOf<OkObjectResult>());
                var okObjectResult = (OkObjectResult)actionResult;
                Assert.That(okObjectResult.Value, Is.InstanceOf<IEnumerable<TNamedModel>>());
                var result = (IEnumerable<TNamedModel>)okObjectResult.Value;
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
