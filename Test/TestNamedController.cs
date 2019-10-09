using Autofac;
using AutoMapper;
using CommonDomainObjects;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;
using Service;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Web.Controllers;

namespace Test
{
    public abstract class TestNamedController<TId, TNamed, TNamedFilters, TIdModel, TNamedModel, TNamedFiltersModel, TNamedController>
        where TNamed : Named<TId>
        where TNamedFilters : NamedFilters
        where TNamedModel: Web.Model.Named<TIdModel>
        where TNamedController: NamedController<TId, TNamed, TNamedFilters, TIdModel, TNamedModel, TNamedFiltersModel>
    {
        protected IContainer _container;

        public abstract TNamed Create(string name);

        [Test]
        public async Task Get()
        {
            var named = Create("ABC");
            Assert.That(named, Is.Not.Null);

            using(var scope = _container.BeginLifetimeScope())
            {
                var mapper = scope.Resolve<IMapper>();
                var controller = scope.Resolve<TNamedController>();
                var actionResult = await controller.GetAsync(mapper.Map<TIdModel>(named.Id));
                Assert.That(actionResult, Is.Not.Null);
                Assert.That(actionResult, Is.InstanceOf<OkObjectResult>());
                var okObjectResult = (OkObjectResult)actionResult;
                Assert.That(okObjectResult.Value, Is.InstanceOf<TNamedModel>());
                var namedModel = (TNamedModel)okObjectResult.Value;
                Assert.That(namedModel.Id, Is.EqualTo(mapper.Map<TIdModel>(named.Id)));
            }
        }

        //[TestCaseSource("NameFragmentTestCases")]
        //public async Task FindForNameFragment(
        //    string name,
        //    string nameFragment,
        //    bool contains
        //    )
        //{
        //    var named = Create(name);
        //    Assert.That(named, Is.Not.Null);

        //    using(var scope = _container.BeginLifetimeScope())
        //    {
        //        var service = scope.Resolve<INamedService<TId, TNamed, TNamedFilters>>();
        //        var result = await service.FindAsync(
        //            new TNamedFilters
        //            {
        //                NameFragment = nameFragment
        //            });
        //        Assert.That(result.Contains(named), Is.EqualTo(contains));
        //    }
        //}

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
