using CommonDomainObjects;
using NUnit.Framework;
using System.Collections.Generic;
using System.Linq;

namespace Test
{
    [TestFixture]
    public class TestHierarchy
    {
        private static readonly IDictionary<char, IList<char>> _parent = new Dictionary<char, IList<char>>
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
            var hierarchy = new Hierarchy<char>(_parent);
            Assert.That(hierarchy[lhs].Contains(hierarchy[rhs]), Is.EqualTo(contains));
        }

        [Test]
        public void NewHierarchy()
        {
            var child = _parent.Transpose();
            var hierarchy = new Hierarchy<char>(_parent);
            Assert.That(hierarchy.Members.Count, Is.EqualTo(_parent.Count));

            Assert.That(_parent.Keys.Verify(
                member          => hierarchy[member],
                member          => _parent[member].FirstOrDefault(),
                hierarchyMember => hierarchyMember.Parent), Is.True);

            Assert.That(_parent.Keys.Verify(
                member          => hierarchy[member],
                member          => child[member],
                hierarchyMember => hierarchyMember.Children), Is.True);

            Assert.That(hierarchy.Members
                .Where(hierarchyMember => hierarchyMember.Parent != null)
                .All(hierarchyMember => hierarchyMember.Parent.Contains(hierarchyMember)));
        }
    }
}
