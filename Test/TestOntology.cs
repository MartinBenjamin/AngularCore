using CommonDomainObjects;
using Deals;
using NUnit.Framework;
using Ontology;
using Organisations;
using Roles;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

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

        [TestCase(0 , true)]
        [TestCase("", true)]
        public void TestThing(
            object individual,
            bool   result
            ) => Assert.That(Ontology.Ontology.Thing.HasMember(
                null,
                null,
                individual),
                Is.EqualTo(result));

        [TestCase(0 , false)]
        [TestCase("", false)]
        public void TestNothing(
            object individual,
            bool   result
            ) => Assert.That(Ontology.Ontology.Nothing.HasMember(
                null,
                null,
                individual),
                Is.EqualTo(result));

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
            var classifications = dealOntology.Classify(deal);
            Assert.That(classifications.ContainsKey(deal));
            classifications[deal].ForEach(TestContext.WriteLine);

            var subClassOf = 
            (
                from classExpression in classifications[deal]
                from axiom in dealOntology.GetSuperClasses(classExpression)
                from annotation in axiom.Annotations
                where
                    annotation.Property == dealOntology.Restriction &&
                    axiom.SuperClassExpression is IPropertyRestriction propertyRestriction &&
                    propertyRestriction.PropertyExpression.Name == "Name"
                select axiom
            ).FirstOrDefault();

            Assert.That(subClassOf, Is.Not.Null);
            Assert.That(result, Is.EqualTo(subClassOf.SuperClassExpression.HasMember(
                dealOntology,
                classifications,
                deal)));
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
            var classifications = dealOntology.Classify(deal);
            Assert.That(classifications.ContainsKey(deal));
            Assert.That(classifications.ContainsKey(sponsor));
            classifications[sponsor].ForEach(TestContext.WriteLine);

            var subClassOf =
            (
                from classExpression in classifications[sponsor]
                from axiom in dealOntology.GetSuperClasses(classExpression)
                from annotation in axiom.Annotations
                where
                    annotation.Property == dealOntology.Restriction &&
                    axiom.SuperClassExpression is IPropertyRestriction propertyRestriction &&
                    propertyRestriction.PropertyExpression.Name == "Equity"
                select axiom
            ).FirstOrDefault();

            Assert.That(subClassOf, Is.Not.Null);
            Assert.That(result, Is.EqualTo(subClassOf.SuperClassExpression.HasMember(
                dealOntology,
                classifications,
                sponsor)));
        }

        [TestCase(0, false)]
        [TestCase(1, true )]
        [TestCase(2, true )]
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
            var classifications = dealOntology.Classify(deal);
            Assert.That(classifications.ContainsKey(deal));
            classifications[deal].ForEach(TestContext.WriteLine);

            var subClassOf =
            (
                from classExpression in classifications[deal]
                from axiom in dealOntology.GetSuperClasses(classExpression)
                from annotation in axiom.Annotations
                from annotationAnnotation in annotation.Annotations
                where
                    annotation.Property == dealOntology.Restriction &&
                    annotationAnnotation.Property == dealOntology.SubPropertyName &&
                    annotationAnnotation.Value.Equals("Sponsors") &&
                    axiom.SuperClassExpression is IPropertyRestriction propertyRestriction &&
                    propertyRestriction.PropertyExpression.Name == "Parties"
                select axiom
            ).FirstOrDefault();

            Assert.That(subClassOf, Is.Not.Null);
            Assert.That(result, Is.EqualTo(subClassOf.SuperClassExpression.HasMember(
                dealOntology,
                classifications,
                deal)));
        }


        [TestCase("ProjectFinance", false)]
        [TestCase("Advisory"      , true )]
        public void NoSponsors(
            string className,
            bool   result
            )
        {
            var dealOntology = new DealOntology();
            var @class = dealOntology.GetClasses().FirstOrDefault(c =>  c.Name == className);
            Assert.That(@class, Is.Not.Null);
            var classes = dealOntology.SuperClasses(@class);

            var subClassOf =
            (
                from classExpression in classes
                from axiom in dealOntology.GetSuperClasses(classExpression)
                from annotation in axiom.Annotations
                from annotationAnnotation in annotation.Annotations
                where
                    annotation.Property == dealOntology.Restriction &&
                    annotationAnnotation.Property == dealOntology.SubPropertyName &&
                    annotationAnnotation.Value.Equals("Sponsors") &&
                    axiom.SuperClassExpression is IObjectMaxCardinality objectMaxCardinality &&
                    objectMaxCardinality.Cardinality == 0
                select axiom
            ).FirstOrDefault();

            Assert.That(subClassOf != null, Is.EqualTo(result));
        }

        [TestCase(0, false)]
        [TestCase(1, true )]
        [TestCase(2, true )]
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
            var classifications = dealOntology.Classify(deal);
            Assert.That(classifications.ContainsKey(deal));
            classifications[deal].ForEach(TestContext.WriteLine);

            var subClassOf =
            (
                from classExpression in classifications[deal]
                from axiom in dealOntology.GetSuperClasses(classExpression)
                from annotation in axiom.Annotations
                from annotationAnnotation in annotation.Annotations
                where
                    annotation.Property == dealOntology.Restriction &&
                    annotationAnnotation.Property == dealOntology.SubPropertyName &&
                    annotationAnnotation.Value.Equals("Borrowers") &&
                    axiom.SuperClassExpression is IPropertyRestriction propertyRestriction &&
                    propertyRestriction.PropertyExpression.Name == "Parties"
                select axiom
            ).FirstOrDefault();

            Assert.That(subClassOf, Is.Not.Null);
            Assert.That(result, Is.EqualTo(subClassOf.SuperClassExpression.HasMember(
                dealOntology,
                classifications,
                deal)));
        }

        [TestCase(false)]
        [TestCase(true )]
        public void ExclusiveDeal(
            bool result
            )
        {
            var dealOntology = new DealOntology();
            var exclusiveDeal = dealOntology.GetClasses().FirstOrDefault(@class => @class.Name == "ExclusiveDeal");

            var deal = new Deal(
                Guid.NewGuid(),
                "Test",
                "ProjectFinance",
                null,
                null);

            deal.Classifiers.Add(new ExclusivityClassifier(
                result ? Guid.Empty : ExclusivityClassifierIdentifier.No,
                null));
            var classifications = dealOntology.Classify(deal);

            Assert.That(exclusiveDeal.HasMember(
                dealOntology,
                classifications,
                deal), Is.EqualTo(result));
            Assert.That(classifications[deal].Contains(exclusiveDeal), Is.EqualTo(result));
        }

        [TestCase(false)]
        [TestCase(true)]
        public void ExclusivityMandatory(
            bool result
            )
        {
            var deal = new Deal(
                Guid.NewGuid(),
                "Test",
                "ProjectFinance",
                null,
                null);

            if(result)
                deal.Classifiers.Add(
                    new ExclusivityClassifier(
                        ExclusivityClassifierIdentifier.No,
                        string.Empty));

            var dealOntology = new DealOntology();
            IOntology ontology = dealOntology;

            var classifications = ontology.Classify(deal);
            Assert.That(classifications.ContainsKey(deal));
            classifications[deal].ForEach(TestContext.WriteLine);

            var subClassOf =
            (
                from classExpression in classifications[deal]
                from axiom in dealOntology.GetSuperClasses(classExpression)
                from annotation in axiom.Annotations
                from annotationAnnotation in annotation.Annotations
                where
                    annotation.Property == dealOntology.Restriction &&
                    annotationAnnotation.Property == dealOntology.SubPropertyName &&
                    annotationAnnotation.Value.Equals("Exclusivity") &&
                    axiom.SuperClassExpression is IPropertyRestriction propertyRestriction &&
                    propertyRestriction.PropertyExpression.Name == "Classifiers"
                select axiom
            ).FirstOrDefault();

            Assert.That(subClassOf, Is.Not.Null);
            Assert.That(result, Is.EqualTo(subClassOf.SuperClassExpression.HasMember(
                dealOntology,
                classifications,
                deal)));
        }

        [Test]
        public void Exclusivity()
        {
            var deal = new Deal(
                Guid.NewGuid(),
                "Test",
                "ProjectFinance",
                null,
                null);

            var exclusivity = new Exclusivity(
                Guid.NewGuid(),
                deal,
                DateTime.Today);

            deal.Commitments.Add(exclusivity);

            var dealOntology = new DealOntology();
            IOntology ontology = dealOntology;

            var classifications = ontology.Classify(deal);
            Assert.That(classifications.ContainsKey(exclusivity));
            classifications[exclusivity].ForEach(TestContext.WriteLine);

            var range =
            (
                from classExpression in classifications[exclusivity]
                from dataProperty in ontology.GetDataPropertyExpressions(classExpression)
                from dataPropertyRange in dataProperty.Ranges
                from annotation in dataPropertyRange.Annotations
                where
                    annotation.Property == dealOntology.Validated
                select dataPropertyRange
            ).FirstOrDefault();

            Assert.That(range, Is.Not.Null);
            Assert.That(range.DataPropertyExpression.Name, Is.EqualTo("Date"));
            Assert.That(range.Range, Is.EqualTo(ontology.DateTime));
        }
    }
}
