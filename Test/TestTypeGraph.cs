using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using CommonDomainObjects;
using Deals;

namespace Test
{
    [TestFixture]
    public class TestTypeGraph
    {
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

            Assert.That(PF.Classify(d).Contains(PF.ProjectFinance));
            Assert.That(PF.ProjectFinance.Axioms, Does.Contain(PF.SponsorCardinality));
            Assert.That(PF.NameMandatory.Validate(d), Is.EqualTo(result));

            var failed = (
                from @class in PF.Classify(d)
                from axiom in @class.Axioms
                where !axiom.Validate(d)
                select axiom
            );

            if(!result)
                Assert.That(failed, Does.Contain(PF.NameMandatory));

            else
                Assert.That(failed, Does.Not.Contain(PF.NameMandatory));

            Assert.That(failed, Does.Contain(PF.SponsorCardinality));
        }
    }
}
