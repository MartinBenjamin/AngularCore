﻿using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using CommonDomainObjects;
using Deals;
using Ontology;
using System.Diagnostics;
using Roles;

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

            var failed = 
            (
                from classExpression in classification[deal]
                from axiom in classExpression.SuperClasses
                where !axiom.SuperClassExpression.HasMember(deal)
                select axiom
            );

            if(!result)
            {
                Assert.That(failed, Does.Contain(dealOntology.NameMandatory));
                Assert.That(dealOntology.NameMandatory.SuperClassExpression, Is.InstanceOf<IPropertyRestriction>());
                var propertyRestriction = (IPropertyRestriction)dealOntology.NameMandatory.SuperClassExpression;
                Assert.That(propertyRestriction.PropertyExpression, Is.Not.Null);
                Assert.That(propertyRestriction.PropertyExpression.Name, Is.EqualTo("Name"));

                var named = ontology.Classes["Named"];
                var namedName = named.DataProperties.FirstOrDefault(dataProperty => dataProperty.Name == "Name");
                Assert.That(namedName, Is.Not.Null);
                Assert.That(propertyRestriction.PropertyExpression, Is.EqualTo(namedName));
            }
            else
                Assert.That(failed, Does.Not.Contain(dealOntology.NameMandatory));
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

            var failed = 
            (
                from classExpression in classification[sponsor]
                from axiom in classExpression.SuperClasses
                where axiom.Annotations.Any(annotation => annotation.Property.Name=="Mandatory")
                where !axiom.SuperClassExpression.HasMember(sponsor)
                select axiom
            );

            Assert.That(failed.Count(), Is.EqualTo(result ? 0 : 1));

            if(!result)
            {
                Assert.That(failed.First().SuperClassExpression, Is.InstanceOf<IPropertyRestriction>());
                var propertyRestriction = (IPropertyRestriction)failed.First().SuperClassExpression;
                Assert.That(propertyRestriction.PropertyExpression, Is.Not.Null);
                Assert.That(propertyRestriction.PropertyExpression.Name, Is.EqualTo("Equity"));
            }
        }


        [TestCase]
        public void SponsorsMandatory()
        {
            var deal = new Deal(
                Guid.NewGuid(),
                "Test",
                "ProjectFinance",
                null,
                null);

            var dealOntology = new DealOntology();
            IOntology ontology = dealOntology;

            var classification = ontology.Classify(deal);
            Assert.That(classification.ContainsKey(deal));
            classification[deal].ForEach(TestContext.WriteLine);

            var failed =
            (
                from classExpression in classification[deal]
                from axiom in classExpression.SuperClasses
                where !axiom.SuperClassExpression.HasMember(deal)
                select axiom
            );

            Assert.That(failed, Does.Contain(dealOntology.SponsorCardinality));
        }

        [TestCase(null , false)]
        [TestCase(""   , false)]
        [TestCase("a"  , true )]
        [TestCase("ab" , true )]
        [TestCase("abc", true )]
        public void TestX(
            string value,
            bool   result
            )
        {
            var d = new Deal(
                Guid.NewGuid(),
                value,
                "ProjectFinance",
                null,
                null);

            var copy = new Deal(
                d.Id,
                null,
                null,
                null,
                null);
            var ontology = new DealOntology();

            var dealClass = ((IOntology)ontology).Classes["Deal"];

            Assert.That(dealClass.Keys, Is.Not.Empty);
            Assert.That(dealClass.Keys[0].AreEqual(d, d), Is.True);
            Assert.That(dealClass.AreEqual(d, d), Is.True);
            Assert.That(dealClass.AreEqual(d, copy), Is.True);
            Assert.That(dealClass.SuperClasses.Contains(ontology.NameMandatory));

            var classExpressions = ontology.Classify(d);
            Assert.That(classExpressions.ContainsKey(d));
            classExpressions[d].ForEach(TestContext.WriteLine);

            var ids = ontology.Id.Values(d).ToList();
            Assert.That(ids.Count, Is.EqualTo(1));
            Assert.That(ids[0], Is.EqualTo(d.Id));
            Assert.That(ids[0], Is.Not.EqualTo(Guid.Empty));
            ids = ontology.Id.Values(new object()).ToList();
            Assert.That(ids, Is.Empty);
            //return;
            //Assert.That(PF.ProjectFinance.ClassAxioms, Does.Contain(PF.SponsorCardinality));
            //Assert.That(PF.NameMandatory.Validate(d), Is.EqualTo(result));

            var failed = 
            (
                from classExpression in classExpressions[d]
                from axiom in classExpression.SuperClasses
                where !axiom.SuperClassExpression.HasMember(d)
                select axiom
            );

            if(!result)
                Assert.That(failed, Does.Contain(ontology.NameMandatory));

            else
                Assert.That(failed, Does.Not.Contain(ontology.NameMandatory));

            Assert.That(failed, Does.Contain(ontology.SponsorCardinality));
        }
    }
}
