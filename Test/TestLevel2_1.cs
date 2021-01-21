using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

namespace Test
{
    [TestFixture]
    public class TestLevel2_1: Test
    {
        public static int FibonacciIndexReference(
            int n
            )
        {
            int index   = 0;
            int current = 0;
            int next    = 1;

            while(next <= n)
            {
                var sum = current + next;
                current = next;
                next = sum;
                index += 1;
            }

            return index;
        }

        public int FibonacciIndex(
            int n
            )
        {
            // From Binet's Formula.
            return Convert.ToInt32(Math.Floor((Math.Log10(n * Math.Sqrt(5) + 0.5) / Math.Log10((Math.Sqrt(5) + 1) / 2))));
        }

        public int Minimum(
            int totalLambs
            )
        {
            int henchmen = 0;
            int next = 1;
            while(totalLambs >= next)
            {
                henchmen += 1;
                totalLambs -= next;
                next += next;
            }
            return henchmen;
        }

        public int Minimum2(
            int totalLambs
            )
        {
            return Convert.ToInt32(Math.Floor(Math.Log10(totalLambs + 1)/Math.Log10(2)));
        }

        public int Maximum(
            int totalLambs
            )
        {
            // Minimum allocations are Fibonacci numbers.
            int henchmen = 0;
            int previous = 0;
            int next = 1;
            while(totalLambs >= next)
            {
                henchmen += 1;
                totalLambs -= next;
                var sum = previous + next;
                previous = next;
                next = sum;
            }
            return henchmen;
        }

        public int Maximum2(
            int totalLambs
            )
        {
            return FibonacciIndex(totalLambs + 1) - 2;
        }

        public int Difference(
            int totalLambs
            )
        {
            return Maximum(totalLambs) - Minimum(totalLambs);
        }

        [TestCase(0, 0)]
        [TestCase(1, 1)]
        [TestCase(2, 1)]
        [TestCase(3, 2)]
        [TestCase(4, 2)]
        [TestCase(5, 2)]
        [TestCase(6, 2)]
        [TestCase(7, 3)]
        [TestCase(8, 3)]
        [TestCase(9, 3)]
        [TestCase(10, 3)]
        [TestCase(1000000000, 29)]
        public void TestMinium(
            int totalLambs,
            int expectedMinimun
            )
        {
            var stopWatch = new Stopwatch();
            stopWatch.Start();
            Assert.That(Minimum(totalLambs), Is.EqualTo(expectedMinimun));
            stopWatch.Stop();
            TestContext.WriteLine(stopWatch.ElapsedMilliseconds);
            TestContext.WriteLine(stopWatch.ElapsedTicks);
        }

        [TestCase(0, 0)]
        [TestCase(1, 1)]
        [TestCase(2, 2)]
        [TestCase(3, 2)]
        [TestCase(4, 3)]
        [TestCase(5, 3)]
        [TestCase(6, 3)]
        [TestCase(7, 4)]
        [TestCase(8, 4)]
        [TestCase(9, 4)]
        [TestCase(10, 4)]
        [TestCase(1000000000, 42)]
        public void TestMaximum(
            int totalLambs,
            int expectedMaximum
            )
        {
            var stopWatch = new Stopwatch();
            stopWatch.Start();
            Assert.That(Maximum(totalLambs), Is.EqualTo(expectedMaximum));
            stopWatch.Stop();
            TestContext.WriteLine(stopWatch.ElapsedMilliseconds);
            TestContext.WriteLine(stopWatch.ElapsedTicks);
        }

//        [TestCaseSource("FibonacciIndexTestCases")]
        public void TestFibonacciIndex(
            int n,
            int expectedIndex
            )
        {
            Assert.That(FibonacciIndex(n), Is.EqualTo(expectedIndex));
        }

        [TestCaseSource("ProvidedTestCases")]
        [TestCaseSource("ExtraTestCases")]
        public void TestDifference(
            int totalLambs,
            int expectedDifference
            )
        {
            Assert.That(Difference(totalLambs), Is.EqualTo(expectedDifference));
        }

        public static IEnumerable<object[]> ProvidedTestCases
        {
            get
            {
                return new List<object[]>
                {
                    new object[]
                    {
                        143,
                        3
                    },
                    new object[]
                    {
                        10,
                        1
                    }
                };
            }
        }

        public static IEnumerable<object[]> ExtraTestCases
        {
            get
            {
                return new List<object[]>
                {
                    new object[]
                    {
                        1000000000,
                        42-29
                    }
                };
            }
        }

        public static IEnumerable<object[]> FibonacciIndexTestCases
        {
            get
            {
                //return Enumerable.Empty<object[]>();
                return Enumerable.Range(1, 500).Select(
                    n => new object[]
                    {
                        n,
                        FibonacciIndexReference(n)
                    });
            }
        }
    }
}
