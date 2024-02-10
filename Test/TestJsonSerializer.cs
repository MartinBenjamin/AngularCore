using NUnit.Framework;
using System;
using System.Text.Json;

namespace Test
{
    [TestFixture]
    public class TestJsonSerializer
    {
        [Test]
        public void Test()
        {
            TestContext.WriteLine(JsonSerializer.Serialize(DateTime.Now));
            TestContext.WriteLine(JsonSerializer.Serialize(3));
            TestContext.WriteLine(JsonSerializer.Serialize<object>(null));
            Assert.That(JsonSerializer.Serialize<object>(null), Is.EqualTo("null"));
        }
    }
}
