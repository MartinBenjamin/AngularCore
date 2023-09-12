using CommonDomainObjects;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Test
{
    [TestFixture]
    public class TestHierarchy
    {
        private static readonly IDictionary<char, IList<char>> _child = new Dictionary<char, IList<char>>
        {
            { 'A', new char[]{} },
            { 'B', new char[]{ 'C', 'D' } },
            { 'C', new char[]{} },
            { 'D', new char[]{} },
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
            var hierarchy = new Hierarchy<char>(_child);
            Assert.That(hierarchy[lhs].Contains(hierarchy[rhs]), Is.EqualTo(contains));
        }

        [Test]
        public void NewHierarchy()
        {
            var parent = _child.Transpose();
            var hierarchy = new Hierarchy<char>(_child);
            Assert.That(hierarchy.Members.Count, Is.EqualTo(_child.Count));

            Func<char, HierarchyMember<char>> map = member => hierarchy[member];
            Func<HierarchyMember<char>, char> inverseMap =
                hierarchyMember => hierarchyMember != null ? hierarchyMember.Member : default;

            Assert.That(parent.Keys.All(
                c =>
                    map.PreservesStructure(
                        member          => parent[member].FirstOrDefault(),
                        hierarchyMember => hierarchyMember.Parent,
                        c) &&
                    map.PreservesStructure(
                        member          => _child[member],
                        hierarchyMember => hierarchyMember.Children,
                        c)), Is.True);

            Assert.That(hierarchy.Members.All(
                hm =>
                    inverseMap.PreservesStructure(
                        hierarchyMember => hierarchyMember.Parent,
                        member          => parent[member].FirstOrDefault(),
                        hm) &&
                    inverseMap.PreservesStructure(
                        hierarchyMember => hierarchyMember.Children,
                        member          => _child[member],
                        hm)), Is.True);

            Assert.That(hierarchy.Members
                .Where(hierarchyMember => hierarchyMember.Parent != null)
                .All(hierarchyMember => hierarchyMember.Parent.Contains(hierarchyMember)));
        }
    }
}
