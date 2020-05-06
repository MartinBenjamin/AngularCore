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
    }
}
