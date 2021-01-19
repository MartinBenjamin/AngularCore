using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

namespace Test
{
    [TestFixture]    
    public class TestLevel2: Test
    {
        public class Vertex
        {
            private readonly SortedList<int, Vertex> _children        = new SortedList<int, Vertex>();
            private readonly IList<string>           _revisionNumbers = new List<string>();

            private Vertex()
            {
            }

            private void Add(
                string revisionNumber
                ) => Add(
                    revisionNumber,
                    revisionNumber.Split('.').Select(int.Parse).ToArray(),
                    0);

            private void Add(
                string revisionNumber,
                int[]  structuredRevisionNumber,
                int    index
                )
            {
                var component = structuredRevisionNumber[index];
                if(!_children.TryGetValue(
                    component,
                    out var child))
                {
                    child = new Vertex();
                    _children.Add(
                        component,
                        child);
                }

                if(structuredRevisionNumber.Length == index + 1)
                    child._revisionNumbers.Add(revisionNumber);

                else
                    child.Add(
                        revisionNumber,
                        structuredRevisionNumber,
                        index + 1);

            }

            public string[] Extract()
            {
                var revisionNumbers = new List<string>();
                Extract(revisionNumbers);
                return revisionNumbers.ToArray();
            }

            public void Extract(
                List<string> revisionNumbers
                )
            {
                revisionNumbers.AddRange(_revisionNumbers);

                foreach(var child in _children.Values)
                    child.Extract(revisionNumbers);
            }

            public static Vertex Populate(
                IEnumerable<string> revisionNumbers
                )
            {
                var vertex = new Vertex();
                foreach(var revisionNumber in revisionNumbers)
                    vertex.Add(revisionNumber);

                return vertex;
            }
        }

        private string[] Sort(
            string[] revisionNumbers
            )
        {
            var vertex = Vertex.Populate(revisionNumbers);
            return vertex.Extract();
        }

        private string ToString(
            string[] revisions
            ) => revisions.Aggregate((lhs, rhs) => lhs + ", " + rhs);

        [TestCaseSource("ProvidedTestCases")]
        public void Test(
            TestDataList<string> revisionNumbers,
            TestDataList<string> expected
            )
        {
            var stopwatch = new Stopwatch();
            stopwatch.Start();
            var sorted = Sort(revisionNumbers.ToArray());
            stopwatch.Stop();
            TestContext.WriteLine(stopwatch.ElapsedTicks);
            TestContext.WriteLine(stopwatch.ElapsedMilliseconds);
            Assert.That(ToString(sorted), Is.EqualTo(ToString(expected.ToArray())));
        }

        [Test]
        public void Test100()
        {
            var random = new Random();
            var revisionNumbers = Enumerable
                .Range(0, 100).Select(
                    i => random.Next().ToString() + '.' + random.Next() + '.' + random.Next()).ToList();

            var stopwatch = new Stopwatch();
            stopwatch.Start();
            var sorted = Sort(revisionNumbers.ToArray());
            stopwatch.Stop();
            TestContext.WriteLine(stopwatch.ElapsedMilliseconds);
        }

        public static IEnumerable<object[]> ProvidedTestCases
        {
            get
            {
                var testCases = new List<object[]>
                {
                    new object[]
                    {
                        new TestDataList<string>{ "1.11", "2.0.0", "1.2", "2", "0.1", "1.2.1", "1.1.1", "2.0" },
                        new TestDataList<string>{ "0.1", "1.1.1", "1.2", "1.2.1", "1.11", "2", "2.0", "2.0.0" }
                    },
                    new object[]
                    {
                        new TestDataList<string>{ "1.1.2", "1.0", "1.3.3", "1.0.12", "1.0.2" },
                        new TestDataList<string>{ "1.0", "1.0.2", "1.0.12", "1.1.2", "1.3.3" }
                    },
                    new object[]
                    {
                        new TestDataList<string>{ "1.0.0", "1.0", "1" },
                        new TestDataList<string>{ "1", "1.0", "1.0.0" }
                    },
                    new object[]
                    {
                        new TestDataList<string>{ "0.0", "0" },
                        new TestDataList<string>{ "0", "0.0" }
                    }
                };
                return testCases;
            }
        }
    }
}
