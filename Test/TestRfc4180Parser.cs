using NUnit.Framework;
using Peg;
using System.IO;

namespace Test
{
    [TestFixture]
    public class TestRfc4180Parser
    {
        [Test]
        public void Test()
        {
            var content = File.ReadAllText(@"C:\Users\Martin\Documents\GitHub\CommonDomainObjects\Test\ISO3166-1.csv");
            int count = 0;
            var parser = new Rfc4180Parser(
                field => { },
                ()    => count += 1);
            var length = parser.Parse(content);
            Assert.That(length, Is.EqualTo(content.Length));
        }
    }
}
