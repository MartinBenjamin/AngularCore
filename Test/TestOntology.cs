﻿using CommonDomainObjects;
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

            Assert.That(dealOntology.Validate(classifications)[deal][Deals.CommonDomainObjects.Instance.Name].Any(), Is.Not.EqualTo(result));
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

            var errors = dealOntology.Validate(classifications);
            Assert.That(errors.ContainsKey(sponsor) && errors[sponsor][DealParties.Instance.Equity].Any(), Is.Not.EqualTo(result));
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

            Assert.That(dealOntology.Validate(classifications)[deal][dealOntology.Sponsors].Any(), Is.Not.EqualTo(result));
        }

        [TestCase("ProjectFinance", false)]
        [TestCase("Advisory"      , true )]
        public void NoSponsors(
            string className,
            bool   result
            )
        {
            var dealOntology = new DealOntology();
            var @class = dealOntology.Get<IClass>().FirstOrDefault(c =>  c.Name == className);
            Assert.That(@class, Is.Not.Null);
            var classes = dealOntology.SuperClasses(@class);

            var subClassOf =
            (
                from classExpression in classes
                from axiom in dealOntology.GetSuperClasses(classExpression)
                from annotation in axiom.Annotations
                from annotationAnnotation in annotation.Annotations
                where
                    annotation.Property == Validation.Instance.Restriction &&
                    annotationAnnotation.Property == Validation.Instance.SubPropertyName &&
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

            Assert.That(dealOntology.Validate(classifications)[deal][dealOntology.Borrowers].Any(), Is.Not.EqualTo(result));
        }

        [TestCase(false)]
        [TestCase(true )]
        public void ExclusiveDeal(
            bool result
            )
        {
            var dealOntology = new DealOntology();
            var exclusiveDeal = dealOntology.Get<IClass>().FirstOrDefault(@class => @class.Name == "ExclusiveDeal");

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
        [TestCase(true )]
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

            var classifications = dealOntology.Classify(deal);
            Assert.That(classifications.ContainsKey(deal));
            classifications[deal].ForEach(TestContext.WriteLine);

            Assert.That(dealOntology.Validate(classifications)[deal][dealOntology.Exclusivity].Any(), Is.Not.EqualTo(result));
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
                from dataPropertyRange in ontology.Get<IDataPropertyRange>()
                from annotation in dataPropertyRange.Annotations
                where
                    dataPropertyRange.DataPropertyExpression == dataProperty &&
                    annotation.Property == Validation.Instance.RangeValidated
                select dataPropertyRange
            ).FirstOrDefault();

            Assert.That(range, Is.Not.Null);
            Assert.That(range.DataPropertyExpression.Name, Is.EqualTo("Date"));
            Assert.That(range.Range, Is.EqualTo(ontology.DateTime));
        }
    }
}
