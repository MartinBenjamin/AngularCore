using CommonDomainObjects;
using NUnit.Framework;
using System.Collections.Generic;
using System.Linq;

namespace Test
{
    [TestFixture]
    public class TestHierarchy
    {
        private static readonly IDictionary<char, IList<char>> _hierarchy = new Dictionary<char, IList<char>>
        {
            {'A', new char[]{} },
            {'B', new char[]{} },
            {'C', new char[]{ 'B' } },
            {'D', new char[]{ 'B' } },
        };

        [TestCase('A', 'A', true )]
        [TestCase('A', 'B', false)]
        [TestCase('A', 'C', false)]
        [TestCase('A', 'D', false)]
        [TestCase('B', 'A', false)]
        [TestCase('B', 'B', true )]
        [TestCase('B', 'C', true )]
        [TestCase('B', 'D', true )]
        [TestCase('C', 'A', false)]
        [TestCase('C', 'B', false)]
        [TestCase('C', 'C', true )]
        [TestCase('C', 'D', false)]
        [TestCase('D', 'A', false)]
        [TestCase('D', 'B', false)]
        [TestCase('D', 'C', false)]
        [TestCase('D', 'D', true )]
        public void Contains(
            char lhs,
            char rhs,
            bool contains
            )
        {
            var hierarchy = new Hierarchy<char>(_hierarchy);
            Assert.That(hierarchy[lhs].Contains(hierarchy[rhs]), Is.EqualTo(contains));
        }

        [Test]
        public void NewHierarchy()
        {
            var hierarchy = new Hierarchy<char>(_hierarchy);
            Assert.That(hierarchy.Members.Count, Is.EqualTo(_hierarchy.Count));
            foreach(var member in _hierarchy.Keys)
            {
                var hierarchyMember = hierarchy[member];
                Assert.That(hierarchyMember       , Is.Not.Null       );
                Assert.That(hierarchyMember.Member, Is.EqualTo(member));

                var parentMember = _hierarchy[member].FirstOrDefault();
                var parentHierarchyMember = hierarchy[parentMember];

                Assert.That(hierarchyMember.Parent, Is.EqualTo(parentHierarchyMember));

                if(parentHierarchyMember != null)
                {
                    Assert.That(parentHierarchyMember.Children, Has.Member(hierarchyMember));
                    Assert.That(parentHierarchyMember.Interval.Contains(hierarchyMember.Interval));
                }
            }

            foreach(var hierarchyMember in hierarchy.Members)
                Assert.That(_hierarchy.ContainsKey(hierarchyMember.Member), Is.True);
        }
    }
}
