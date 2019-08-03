using CommonDomainObjects;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Test
{
    [TestFixture]
    public class TestDomainObject
    {
        private class T1: DomainObject<int>
        {
            public T1() : base()
            {
            }

            public T1(
                int id
                ) : base(id)
            {
            }
        }

        private class T2: DomainObject<int>
        {
            public T2()
                : base()
            {
            }

            public T2(
                int id
                )
                : base(id)
            {
            }
        }

        [TestCaseSource("EqualityTestCases")]
        public void Equality(
            DomainObject<int> lhs,
            DomainObject<int> rhs,
            bool              equals
            )
        {
            Assert.That(lhs == rhs, Is.EqualTo(equals));
            Assert.That(rhs == lhs, Is.EqualTo(lhs == rhs));
            Assert.That(lhs != rhs, Is.Not.EqualTo(equals));
            Assert.That(rhs != lhs, Is.EqualTo(rhs != lhs));
        }

        [TestCaseSource("ReferenceEqualityTestCases")]
        public void ReferenceEquality(
            DomainObject<int> domainObject
            )
        {
            Assert.That(domainObject.Equals(domainObject), Is.True);
        }

        public static IEnumerable<object[]> EqualityTestCases
        {
            get
            {
                var ids       = Enumerable.Range(0, 3).ToList();
                var factories = new Func<int, DomainObject<int>>[]
                    {
                        id => new T1(id),
                        id => new T2(id)
                    };

                return
                    from lhsId in ids
                    from rhsId in ids
                    from lhsFactory in factories
                    from rhsFactory in factories
                    let lhs = lhsFactory(lhsId)
                    let rhs = rhsFactory(rhsId)
                    select new object[]
                    {
                        lhs,
                        rhs,
                        lhsId         != default(int) &&
                        lhsId         == rhsId        &&
                        lhs.GetType() == rhs.GetType()
                    };
            }
        }

        public static IEnumerable<object[]> ReferenceEqualityTestCases
        {
            get
            {
                return
                    from id in Enumerable.Range(0, 3).ToList()
                    let t1 = new T1(id)
                    select new object[]
                    {
                        t1
                    };
            }
        }
    }
}
