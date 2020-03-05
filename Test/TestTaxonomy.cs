using CommonDomainObjects;
using NUnit.Framework;
using System.Collections.Generic;
using System.Linq;

namespace Test
{
    [TestFixture]
    public class TestTaxonomy
    {
        private static readonly IDictionary<char, IList<char>> _taxonomy = new Dictionary<char, IList<char>>
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
            var taxonomy = new Taxonomy<char>(_taxonomy);
            Assert.That(taxonomy[lhs].Contains(taxonomy[rhs]), Is.EqualTo(contains));
        }

        [Test]
        public void NewTaxonomy()
        {
            var taxonomy = new Taxonomy<char>(_taxonomy);
            Assert.That(taxonomy.Terms.Count, Is.EqualTo(_taxonomy.Count));
            foreach(var term in _taxonomy.Keys)
            {
                var taxonomyTerm = taxonomy[term];
                Assert.That(taxonomyTerm, Is.Not.Null);
                Assert.That(taxonomyTerm.Term, Is.EqualTo(term));

                var broaderTerm = _taxonomy[term].FirstOrDefault();
                var broaderTaxonomyTerm = taxonomy[broaderTerm];

                Assert.That(taxonomyTerm.Broader, Is.EqualTo(broaderTaxonomyTerm));

                if(broaderTaxonomyTerm != null)
                {
                    Assert.That(broaderTaxonomyTerm.Narrower, Has.Member(taxonomyTerm));
                    Assert.That(broaderTaxonomyTerm.Interval.Contains(taxonomyTerm.Interval));
                }
            }
        }
    }
}
