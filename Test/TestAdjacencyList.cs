using CommonDomainObjects;
using NUnit.Framework;
using System.Collections.Generic;

namespace Test
{
    [TestFixture]
    public class TestAdjacencyList
    {
        private static readonly IDictionary<char, IList<char>> _graph = new Dictionary<char, IList<char>>
        {
            {'A', new char[]{} },
            {'B', new char[]{ 'A' } },
            {'C', new char[]{ 'A', 'B' } },
        };

        [TestCase('A', 0)]
        [TestCase('B', 1)]
        [TestCase('C', 2)]
        public void LongestPath(
            char vertex,
            int  longestPath
            )
        {
            Assert.That(_graph.LongestPath(vertex), Is.EqualTo(longestPath));
        }

        [Test]
        public void TopologicalSort()
        {
            Assert.That(_graph.TopologicalSort(), Is.EqualTo(new []{ 'A', 'B', 'C' }));
        }
    }
}
