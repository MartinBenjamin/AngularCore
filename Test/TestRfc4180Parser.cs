using Peg;
using NUnit.Framework;
using System.IO;
using System.Diagnostics;
using System.Linq;

namespace Test
{
    [TestFixture]
    public class TestRfc4180Parser
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
