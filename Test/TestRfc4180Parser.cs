using Data;
using NUnit.Framework;
using Peg;
using System.Collections.Generic;
using System.Linq;

namespace Test
{
    [TestFixture]
    public class TestRfc4180Parser
    {
        [TestCase("ISO3166-1.csv")]
        [TestCase("ISO4217.csv"  )]
        public void LoadFile(
            string fileName
            )
        {
            var content = Loader.ReadAllText(fileName);
            int count = 0;
            var parser = new Rfc4180Parser(
                field => { },
                ()    => count += 1);
            var length = parser.Parse(content);
            Assert.That(length, Is.EqualTo(content.Length));
        }

        [TestCaseSource("ParseCases")]
        public void Parse(
            string               input,
            IList<IList<string>> expected,
            int                  expectedLength
            )
        {
            var row = 0;
            var record = new List<string>();
            var parser = new Rfc4180Parser(
                field => record.Add(field),
                () =>
                {
                    Assert.That(record.SequenceEqual(expected[row]), Is.True);
                    row += 1;
                    record.Clear();
                });
            var length = parser.Parse(input);
            Assert.That(length, Is.EqualTo(expectedLength));
        }

        public static IEnumerable<object[]> ParseCases
        {
            get
            {
                var testCases = new List<object[]>();
                testCases.Add(
                    new object[]
                    {
                        string.Empty,
                        Convert(new string[,]{}),
                        string.Empty.Length
                    });
                testCases.Add(
                    new object[]
                    {
                        "\r\n",
                        Convert(new string[,]{ { string.Empty } }),
                        2
                    });
                testCases.Add(
                    new object[]
                    {
                        "ab\r\n",
                        Convert(new string[,]{ { "ab" } }),
                        4
                    });
                testCases.Add(
                    new object[]
                    {
                        "ab\r\ncd\r\n",
                        Convert(new string[,]{ { "ab" }, { "cd" } }),
                        8
                    });
                testCases.Add(
                    new object[]
                    {
                        "ab,cd\r\n",
                        Convert(new string[,]{ { "ab", "cd" } }),
                        7
                    });
                testCases.Add(
                    new object[]
                    {
                        "ab,cd\r\nef,gh\r\n",
                        Convert(new string[,]{ { "ab", "cd" }, { "ef", "gh" } }),
                        14
                    });
                return testCases;
            }
        }

        private static IList<IList<string>> Convert(
            string[,] recordSet
            )
        {
            IList<IList<string>> encoded = new TestDataList<IList<string>>();
            for(var row = 0; row < recordSet.GetLength(0); row++)
            {
                var record = new TestDataList<string>();
                encoded.Add(record);
                for(var column = 0; column < recordSet.GetLength(1); column++)
                    record.Add(recordSet[row, column]);
            }
            return encoded;
        }

        [Test]
        public void Load()
        {
            var currencies = Loader.LoadCurrencies();
        }
    }
}
