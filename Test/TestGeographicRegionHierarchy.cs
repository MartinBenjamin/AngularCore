using CommonDomainObjects;
using Iso3166._2;
using Locations;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Test
{
    [TestFixture]    
    public class TestGeographicRegionHierarchy
    {
        private static readonly IDictionary<char, IList<char>> _parent = new Dictionary<char, IList<char>>
        {
            { 'A', new char[]{} },
            { 'B', new char[]{} },
            { 'C', new char[]{ 'B' } },
            { 'D', new char[]{ 'B' } },
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

            var map = _parent.Keys.ToDictionary(
                vertex => vertex,
                vertex => (GeographicRegion)new Subdivision(
                    vertex.ToString(),
                    vertex.ToString(),
                    null,
                    null,
                    null));
            var geographicRegionHierarchy = new GeographicRegionHierarchy(_parent.Select(c => map[c]));
            Assert.That(geographicRegionHierarchy[map[lhs]].Contains(geographicRegionHierarchy[map[rhs]]), Is.EqualTo(contains));
        }

        [Test]
        public void NewClassificationScheme()
        {
            var parent = _parent.Select(
                vertex => (GeographicRegion)new Subdivision(
                    vertex.ToString(),
                    vertex.ToString(),
                    null,
                    null,
                    null));
            var child = parent.Transpose();

            var geographicRegionHierarchy = new GeographicRegionHierarchy(parent);
            Assert.That(geographicRegionHierarchy.Members.Count, Is.EqualTo(parent.Count));

            Func<GeographicRegion, GeographicRegionHierarchyMember> map = geographicRegion => geographicRegionHierarchy[geographicRegion];
            Func<GeographicRegionHierarchyMember, GeographicRegion> inverseMap =
                geographicRegionHierarchyMember => geographicRegionHierarchyMember != null ? geographicRegionHierarchyMember.Member : default;

            Assert.That(parent.Keys.All(
                gr =>
                    map.PreservesStructure(
                        geographicRegion                => parent[geographicRegion].FirstOrDefault(),
                        geographicRegionHierarchyMember => geographicRegionHierarchyMember.Parent,
                        gr) &&
                    map.PreservesStructure(
                        geographicRegion                => child[geographicRegion],
                        geographicRegionHierarchyMember => geographicRegionHierarchyMember.Children,
                        gr)), Is.True);

            Assert.That(geographicRegionHierarchy.Members.All(
                grhm =>
                    inverseMap.PreservesStructure(
                        geographicRegionHierarchyMember => geographicRegionHierarchyMember.Parent,
                        geographicRegion                => parent[geographicRegion].FirstOrDefault(),
                        grhm) &&
                    inverseMap.PreservesStructure(
                        geographicRegionHierarchyMember => geographicRegionHierarchyMember.Children,
                        geographicRegion                => child[geographicRegion],
                        grhm)), Is.True);

            Assert.That(geographicRegionHierarchy.Members
                .Where(geographicRegionMember => geographicRegionMember.Parent != null)
                .All(geographicRegionMember => geographicRegionMember.Parent.Contains(geographicRegionMember)));
        }
    }
}
