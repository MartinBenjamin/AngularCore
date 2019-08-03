using CommonDomainObjects;
using NUnit.Framework;
using System.Collections.Generic;
using System.Linq;

namespace Test
{
    [TestFixture]
    public class TestBinarySearch
    {
        [TestCaseSource("BinarySearchFirstTestCases")]
        public void BinarySearchFirst(
            IList<int> list,
            int        value,
            int        index
            )
        {
            Assert.That(
                list.BinarySearchFirst(
                    value,
                    0,
                    list.Count - 1),
                Is.EqualTo(index));
        }

        [TestCaseSource("BinarySearchLastTestCases")]
        public void BinarySearchLast(
            IList<int> list,
            int        value,
            int        index
            )
        {
            Assert.That(
                list.BinarySearchLast(
                    value,
                    0,
                    list.Count - 1),
                Is.EqualTo(index));
        }

        [TestCaseSource("BinarySearchFirstGreaterThanTestCases")]
        public void BinarySearchFirstGreaterThan(
            IList<int> list,
            int        value,
            int        index
            )
        {
            Assert.That(
                list.BinarySearchFirstGreaterThan(
                    value,
                    0,
                    list.Count - 1),
                Is.EqualTo(index));
        }

        [TestCaseSource("BinarySearchLastLessThanTestCases")]
        public void BinarySearchLastLessThan(
            IList<int> list,
            int        value,
            int        index
            )
        {
            Assert.That(
                list.BinarySearchLastLessThan(
                    value,
                    0,
                    list.Count - 1),
                Is.EqualTo(index));
        }

        public static IEnumerable<object[]> BinarySearchFirstTestCases
        {
            get
            {
                var testCases = new List<object[]>();

                var emptyList = new TestDataList<int>();

                testCases.AddRange(
                    from value in new[] { 0, 1, 2 }
                    select new object[]
                    {
                        emptyList,
                        value,
                        -1
                    });

                var list = new TestDataList<int>(1, 1, 3, 3, 3, 5, 5, 5, 5);

                testCases.AddRange(
                    from value in Enumerable.Range(0, 6)
                    let index = list.IndexOf(value)
                    select new object[]
                    {
                        list,
                        value,
                        index
                    });

                return testCases;
            }
        }

        public static IEnumerable<object[]> BinarySearchLastTestCases
        {
            get
            {
                var testCases = new List<object[]>();

                var emptyList = new TestDataList<int>();

                testCases.AddRange(
                    from value in new[] { 0, 1, 2 }
                    select new object[]
                    {
                        emptyList,
                        value,
                        -1
                    });

                var list = new TestDataList<int>(1, 1, 3, 3, 3, 5, 5, 5, 5);

                testCases.AddRange(
                    from value in Enumerable.Range(0, 6)
                    let index = list.LastIndexOf(value)
                    select new object[]
                    {
                        list,
                        value,
                        index
                    });

                return testCases;
            }
        }

        public static IEnumerable<object[]> BinarySearchFirstGreaterThanTestCases
        {
            get
            {
                var testCases = new List<object[]>();

                var emptyList = new TestDataList<int>();

                testCases.AddRange(
                    from value in new[] { 0, 1, 2 }
                    select new object[]
                    {
                        emptyList,
                        value,
                        -1
                    });

                var list = new TestDataList<int>(1, 1, 3, 3, 3, 5, 5, 5, 5);

                testCases.AddRange(
                    new[]
                    {
                        new object[] { list, 0,  0 },
                        new object[] { list, 1,  2 },
                        new object[] { list, 2,  2 },
                        new object[] { list, 3,  5 },
                        new object[] { list, 4,  5 },
                        new object[] { list, 5, -1 },
                        new object[] { list, 6, -1 },
                    });

                return testCases;
            }
        }

        public static IEnumerable<object[]> BinarySearchLastLessThanTestCases
        {
            get
            {
                var testCases = new List<object[]>();

                var emptyList = new TestDataList<int>();

                testCases.AddRange(
                    from value in new[] { 0, 1, 2 }
                    select new object[]
                    {
                        emptyList,
                        value,
                        -1
                    });

                var list = new TestDataList<int>(1, 1, 3, 3, 3, 5, 5, 5, 5);

                testCases.AddRange(
                    new[]
                    {
                        new object[] { list, 0, -1 },
                        new object[] { list, 1, -1 },
                        new object[] { list, 2,  1 },
                        new object[] { list, 3,  1 },
                        new object[] { list, 4,  4 },
                        new object[] { list, 5,  4 },
                        new object[] { list, 6,  8 },
                    });

                return testCases;
            }
        }
    }
}
