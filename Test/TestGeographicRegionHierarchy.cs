using CommonDomainObjects;
using Iso3166._2;
using Locations;
using NUnit.Framework;
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
            Assert.That(parent.Keys.PreservesStructure(
                geographicRegion       => parent[geographicRegion].FirstOrDefault(),
                geographicRegion       => geographicRegionHierarchy[geographicRegion],
                geographicRegionMember => geographicRegionMember.Parent), Is.True);

            Assert.That(geographicRegionHierarchy.Members.PreservesStructure(
                geographicRegionMember => geographicRegionMember.Parent,
                geographicRegionMember => geographicRegionMember?.Member,
                geographicRegion       => parent[geographicRegion].FirstOrDefault()), Is.True);

            Assert.That(parent.Keys.PreservesStructure(
                geographicRegion       => child[geographicRegion],
                geographicRegion       => geographicRegionHierarchy[geographicRegion],
                geographicRegionMember => geographicRegionMember.Children), Is.True);

            Assert.That(geographicRegionHierarchy.Members.PreservesStructure(
                geographicRegionMember => geographicRegionMember.Children,
                geographicRegionMember => geographicRegionMember?.Member,
                geographicRegion        => child[geographicRegion]), Is.True);

            Assert.That(geographicRegionHierarchy.Members
                .Where(geographicRegionMember => geographicRegionMember.Parent != null)
                .All(geographicRegionMember => geographicRegionMember.Parent.Contains(geographicRegionMember)));
        }
    }
}
