using CommonDomainObjects;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Test
{
    [TestFixture]
    public class TestTaxonomy
    {
        private static readonly IDictionary<char, IList<char>> _broader = new Dictionary<char, IList<char>>
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
            var taxonomy = new Taxonomy<char>(_broader);
            Assert.That(taxonomy[lhs].Contains(taxonomy[rhs]), Is.EqualTo(contains));
        }

        [Test]
        public void NewTaxonomy()
        {
            var narrower = _broader.Transpose();
            var taxonomy = new Taxonomy<char>(_broader);
            Assert.That(taxonomy.Terms.Count, Is.EqualTo(_broader.Count));

            Func<char, TaxonomyTerm<char>> map = term => taxonomy[term];
            Func<TaxonomyTerm<char>, char> inverseMap =
                taxonomyTerm => taxonomyTerm != null ? taxonomyTerm.Term : default;

            Assert.That(_broader.Keys.All(
                c =>
                    map.PreservesStructure(
                        term         => _broader[term].FirstOrDefault(),
                        taxonomyTerm => taxonomyTerm.Broader,
                        c) &&
                    map.PreservesStructure(
                        term         => narrower[term],
                        taxonomyTerm => taxonomyTerm.Narrower,
                        c)), Is.True);

            Assert.That(taxonomy.Terms.All(
                hm =>
                    inverseMap.PreservesStructure(
                        taxonomyTerm => taxonomyTerm.Broader,
                        term         => _broader[term].FirstOrDefault(),
                        hm) &&
                    inverseMap.PreservesStructure(
                        taxonomyTerm => taxonomyTerm.Narrower,
                        term         => narrower[term],
                        hm)), Is.True);

            Assert.That(taxonomy.Terms
                .Where(taxonomyTerm => taxonomyTerm.Broader != null)
                .All(taxonomyTerm => taxonomyTerm.Broader.Contains(taxonomyTerm)));
        }
    }
}
