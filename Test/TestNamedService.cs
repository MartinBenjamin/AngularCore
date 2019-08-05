using Autofac;
using CommonDomainObjects;
using NUnit.Framework;
using Service;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

namespace Test
{
    public abstract class TestNamedService<TId, TNamed, TNamedFilters>
        where TNamed: Named<TId>
        where TNamedFilters: NamedFilters, new ()
    {
        private const string _listenerName = "TestListener";
        protected IContainer _container;

        [SetUp]
        public void BaseSetUp()
        {
            if(!Trace.Listeners.Cast<TraceListener>().Any(traceListener => traceListener.Name == _listenerName))
                Trace.Listeners.Add(
                    new TextWriterTraceListener(
                        TestContext.Out,
                        _listenerName));
        }

        public abstract TNamed Create(string name);

        [Test]
        public void Get()
        {
            var named = Create("ABC");
            Assert.That(named, Is.Not.Null);

            using(var scope = _container.BeginLifetimeScope())
            {
                var service = scope.Resolve<INamedService<TId, TNamed, TNamedFilters>>();
                var retrieved = service.Get(named.Id);
                Assert.That(retrieved, Is.EqualTo(named));
            }
        }

        [TestCaseSource("NameFragmentTestCases")]
        public void FindForNameFragment(
            string name,
            string nameFragment,
            bool   contains
            )
        {
            var named = Create(name);
            Assert.That(named, Is.Not.Null);

            using(var scope = _container.BeginLifetimeScope())
            {
                var service = scope.Resolve<INamedService<TId, TNamed, TNamedFilters>>();
                var result = service.Find(
                    new TNamedFilters
                    {
                        NameFragment = nameFragment
                    });
                Assert.IsNotNull(service);
                Assert.That(result.Contains(named), Is.EqualTo(contains));
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
