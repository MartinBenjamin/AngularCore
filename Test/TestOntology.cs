using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using CommonDomainObjects;
using Deals;
using Ontology;
using System.Diagnostics;
using Roles;
using Organisations;

namespace Test
{
    [TestFixture]
    public class TestOntology
    {
        private const string _listenerName = "TestListener";

        [SetUp]
        public void SetUp()
        {
            if(!Trace.Listeners.Cast<TraceListener>().Any(traceListener => traceListener.Name == _listenerName))
                Trace.Listeners.Add(
                    new TextWriterTraceListener(
                        TestContext.Out,
                        _listenerName));
        }

        [Test]
        public void Test()
        {
            var edge = new OneToManyEdge<Deal, DealParty>(deal => deal.Parties);
            Assert.That(edge.Name, Is.EqualTo("Parties"));
            var edge2 = new ManyToOneEdge<DealParty, Deal>(dealParty => dealParty.Deal);
            Assert.That(edge2.Name, Is.EqualTo("Deal"));
        }

        [Test]
        public void ToEnumerable()
        {
            Assert.That(((int?)null).ToEnumerable().Count(), Is.EqualTo(0));
            Assert.That(((int?)0).ToEnumerable().Count(), Is.EqualTo(1));
            Assert.That(0.ToEnumerable().Count(), Is.EqualTo(1));
            int? x = null;
            Assert.That(x, Is.Null);
            foreach(var y in ((int?)0).ToEnumerable())
                x = y;
            Assert.That(x, Is.Not.Null);
            Assert.That(x, Is.EqualTo(0));
        }

        [TestCase(null , false)]
        [TestCase(""   , false)]
        [TestCase("a"  , true )]
        [TestCase("ab" , true )]
        [TestCase("abc", true )]
        public void TestDealNameMandatory(
            string value,
            bool   result
            )
        {
            var deal = new Deal(
                Guid.NewGuid(),
                value,
                "ProjectFinance",
                null,
                null);

            var dealOntology = new DealOntology();
            IOntology ontology = dealOntology;

            var classification = ontology.Classify(deal);
            Assert.That(classification.ContainsKey(deal));
            classification[deal].ForEach(TestContext.WriteLine);

            var subClassOf = 
            (
                from classExpression in classification[deal]
                from axiom in classExpression.SuperClasses
                from annotation in axiom.Annotations
                where
                    annotation.Property == dealOntology.Mandatory &&
                    axiom.SuperClassExpression is IPropertyRestriction propertyRestriction &&
                    propertyRestriction.PropertyExpression.Name == "Name"
                select axiom
            ).FirstOrDefault();

            Assert.That(subClassOf, Is.Not.Null);
            Assert.That(result, Is.EqualTo(subClassOf.SuperClassExpression.HasMember(deal)));
        }

        
        [TestCase(null, false)]
        [TestCase(0   ,  true)]
        [TestCase(1   ,  true)]
        [TestCase(2   ,  true)]
        [TestCase(3   ,  true)]
        public void TestSponsorEquityMandatory(
            decimal? equity,
            bool     result
            )
        {
            var deal = new Deal(
                Guid.NewGuid(),
                "Test",
                "ProjectFinance",
                null,
                null);

            var sponsor = new Sponsor(
                deal,
                null,
                new Role(
                    DealRoleIdentifier.Sponsor,
                    "Sponsor"),
                null,
                equity);
            var dealOntology = new DealOntology();
            IOntology ontology = dealOntology;

            var classification = ontology.Classify(deal);
            Assert.That(classification.ContainsKey(deal));
            Assert.That(classification.ContainsKey(sponsor));
            classification[sponsor].ForEach(TestContext.WriteLine);

            var subClassOf =
            (
                from classExpression in classification[sponsor]
                from axiom in classExpression.SuperClasses
                from annotation in axiom.Annotations
                where
                    annotation.Property == dealOntology.Mandatory &&
                    axiom.SuperClassExpression is IPropertyRestriction propertyRestriction &&
                    propertyRestriction.PropertyExpression.Name == "Equity"
                select axiom
            ).FirstOrDefault();

            Assert.That(subClassOf, Is.Not.Null);
            Assert.That(result, Is.EqualTo(subClassOf.SuperClassExpression.HasMember(sponsor)));
        }

        [TestCase(0, false)]
        [TestCase(1, true )]
        public void SponsorsMandatory(
            int  sponsorCount,
            bool result
            )
        {
            var deal = new Deal(
                Guid.NewGuid(),
                "Test",
                "ProjectFinance",
                null,
                null);

            var role = new Role(
                DealRoleIdentifier.Sponsor,
                null);
            Enumerable
                .Range(0, sponsorCount)
                .ForEach(i => new Sponsor(
                    Guid.NewGuid(),
                    deal,
                    null,
                    role,
                    null,
                    null));
            var dealOntology = new DealOntology();
            IOntology ontology = dealOntology;

            var classification = ontology.Classify(deal);
            Assert.That(classification.ContainsKey(deal));
            classification[deal].ForEach(TestContext.WriteLine);

            var subClassOf =
            (
                from classExpression in classification[deal]
                from axiom in classExpression.SuperClasses
                from annotation in axiom.Annotations
                from annotationAnnotation in annotation.Annotations
                where
                    annotation.Property == dealOntology.Mandatory &&
                    annotationAnnotation.Property == dealOntology.SubPropertyName &&
                    annotationAnnotation.Value.Equals("Sponsors") &&
                    axiom.SuperClassExpression is IPropertyRestriction propertyRestriction &&
                    propertyRestriction.PropertyExpression.Name == "Parties"
                select axiom
            ).FirstOrDefault();

            Assert.That(subClassOf, Is.Not.Null);
            Assert.That(result, Is.EqualTo(subClassOf.SuperClassExpression.HasMember(deal)));
        }

        
        [TestCase(0, false)]
        [TestCase(1, true )]
        public void BorrowersMandatory(
            int  borrowerCount,
            bool result
            )
        {
            var deal = new Deal(
                Guid.NewGuid(),
                "Test",
                "ProjectFinance",
                null,
                null);

            var role = new Role(
                DealRoleIdentifier.Borrower,
                null);
            Enumerable
                .Range(0, borrowerCount)
                .ForEach(i => new DealParty(
                    Guid.NewGuid(),
                    deal,
                    (Organisation)null,
                    role,
                    null));
            var dealOntology = new DealOntology();
            IOntology ontology = dealOntology;

            var classification = ontology.Classify(deal);
            Assert.That(classification.ContainsKey(deal));
            classification[deal].ForEach(TestContext.WriteLine);

            var subClassOf =
            (
                from classExpression in classification[deal]
                from axiom in classExpression.SuperClasses
                from annotation in axiom.Annotations
                from annotationAnnotation in annotation.Annotations
                where
                    annotation.Property == dealOntology.Mandatory &&
                    annotationAnnotation.Property == dealOntology.SubPropertyName &&
                    annotationAnnotation.Value.Equals("Borrowers") &&
                    axiom.SuperClassExpression is IPropertyRestriction propertyRestriction &&
                    propertyRestriction.PropertyExpression.Name == "Parties"
                select axiom
            ).FirstOrDefault();

            Assert.That(subClassOf, Is.Not.Null);
            Assert.That(result, Is.EqualTo(subClassOf.SuperClassExpression.HasMember(deal)));
        }
    }
}
