﻿using NUnit.Framework;
using Peg;
using System.IO;

namespace Test
{
    [TestFixture]
    public class TestRfc4180Parser
    {
        [TestCase("ISO3166-1.csv")]
        [TestCase("ISO4217.csv")]
        public void Test(
            string fileName
            )
        {
            var content = File.ReadAllText(fileName);
            int count = 0;
            var parser = new Rfc4180Parser(
                field => { },
                ()    => count += 1);
            var length = parser.Parse(content);
            Assert.That(length, Is.EqualTo(content.Length));
        }
    }
}
