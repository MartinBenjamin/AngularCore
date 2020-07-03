using CommonDomainObjects;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Test
{
    [TestFixture]
    public class TestClassificationScheme
    {
        private static readonly IDictionary<char, IList<char>> _super = new Dictionary<char, IList<char>>
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
            var map = _super.Keys.ToDictionary(
                vertex => vertex,
                vertex => new Classifier(
                    Guid.Empty,
                    vertex.ToString()));
            var classificationScheme = new ClassificationScheme(_super.Select(c => map[c]));
            Assert.That(classificationScheme[map[lhs]].Contains(classificationScheme[map[rhs]]), Is.EqualTo(contains));
        }

        [Test]
        public void NewClassificationScheme()
        {
            var super = _super.Select(
                vertex => new Classifier(
                    Guid.Empty,
                    vertex.ToString()));
            var sub = super.Transpose();

            var classificationScheme = new ClassificationScheme(super);
            Assert.That(classificationScheme.Classifiers.Count, Is.EqualTo(_super.Count));
            Assert.That(super.Keys.PreservesStructure(
                classifier                     => super[classifier].FirstOrDefault(),
                classifier                     => classificationScheme[classifier],
                classificationSchemeClassifier => classificationSchemeClassifier.Super), Is.True);

            Assert.That(classificationScheme.Classifiers.PreservesStructure(
                classificationSchemeClassifier => classificationSchemeClassifier.Super,
                classificationSchemeClassifier => classificationSchemeClassifier?.Classifier,
                classifier                     => super[classifier].FirstOrDefault()), Is.True);

            Assert.That(super.Keys.PreservesStructure(
                classifier                     => sub[classifier],
                classifier                     => classificationScheme[classifier],
                classificationSchemeClassifier => classificationSchemeClassifier.Sub), Is.True);

            Assert.That(classificationScheme.Classifiers.PreservesStructure(
                classificationSchemeClassifier => classificationSchemeClassifier.Sub,
                classificationSchemeClassifier => classificationSchemeClassifier?.Classifier,
                classifier                     => sub[classifier]), Is.True);

            Assert.That(classificationScheme.Classifiers
                .Where(classificationSchemeClassifier => classificationSchemeClassifier.Super != null)
                .All(classificationSchemeClassifier => classificationSchemeClassifier.Super.Contains(classificationSchemeClassifier)));

        }
    }
}
