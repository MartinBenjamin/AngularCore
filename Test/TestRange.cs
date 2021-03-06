﻿using CommonDomainObjects;
using NUnit.Framework;
using System.Collections.Generic;
using System.Linq;

namespace Test
{
    [TestFixture]
    public class TestRange
    {
        private static readonly int _start;
        private static readonly int _count = 3;

        [TestCaseSource("ConstructTestCases")]
        public void Construct(
            int start,
            int end
            )
        {
            var range = new Range<int>(
                start,
                end);

            Assert.That(range.Start, Is.EqualTo(start));
            Assert.That(range.End  , Is.EqualTo(end  ));
        }

        [TestCaseSource("ContainsTestCases")]
        public void Contains(
            Range<int> range,
            int        i,
            bool       contains
            )
        {

            Assert.That(range.Contains(i), Is.EqualTo(contains));
        }

        [TestCaseSource("ContainsRangeTestCases")]
        public void Contains(
            Range<int> range0,
            Range<int> range1,
            bool       contains
            )
        {
            Assert.That(range0.Contains(range1), Is.EqualTo(contains));
        }

        [TestCaseSource("OverlapsTestCases")]
        public void Overlaps(
            Range<int> range0,
            Range<int> range1,
            bool       overlaps
            )
        {
            Assert.That(range0.Overlaps(range1), Is.EqualTo(overlaps));
        }

        public static IEnumerable<object[]> ConstructTestCases
        {
            get
            {

                return (
                    from start in Enumerable.Range(_start, _count)
                    from end   in Enumerable.Range(start, _count - start)
                    select new object[]
                    {
                        start,
                        end
                    }
                ).ToList();
            }
        }

        public static IEnumerable<object[]> ContainsTestCases
        {
            get
            {

                return (
                    from start in Enumerable.Range(_start, _count)
                    from end   in Enumerable.Range(start, _count - start)
                    from i     in Enumerable.Range(_start, _count)
                    select new object[]
                    {
                        new Range<int>(start, end),
                        i,
                        i >= start && i <= end
                    }
                ).ToList();
            }
        }

        public static IEnumerable<object[]> ContainsRangeTestCases
        {
            get
            {
                var ranges =
                    from start in Enumerable.Range(_start, _count)
                    from end in Enumerable.Range(start, _count - start)
                    select new Range<int>(start, end);

                return (
                    from range0 in ranges
                    from range1 in ranges
                    select new object[]
                    {
                        range0,
                        range1,
                        range0.Start <= range1.Start && range1.End <= range0.End
                    }
                ).ToList();
            }
        }

        public static IEnumerable<object[]> OverlapsTestCases
        {
            get
            {
                var ranges =
                    from start in Enumerable.Range(_start, _count)
                    from end in Enumerable.Range(start, _count - start)
                    select new Range<int>(start, end);

                return (
                    from range0 in ranges
                    from range1 in ranges
                    select new object[]
                    {
                        range0,
                        range1,
                        range0.Start <= range1.End && range0.End >= range1.Start
                    }
                ).ToList();
            }
        }
    }
}
