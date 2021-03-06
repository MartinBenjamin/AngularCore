﻿using CommonDomainObjects;
using Data;
using NUnit.Framework;
using Peg;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Test
{
    [TestFixture]
    public class TestRfc4180Parser
    {
        [TestCase("ISO3166-1.csv"   )]
        [TestCase("ISO3166-2-AE.csv")]
        [TestCase("ISO3166-2-CA.csv")]
        [TestCase("ISO3166-2-GB.csv")]
        [TestCase("ISO3166-2-PT.csv")]
        [TestCase("ISO3166-2-US.csv")]
        [TestCase("ISO4217.csv"     )]
        public async Task LoadFile(
            string fileName
            )
        {
            var content = await CsvExtractor.ReadAllTextAsync(fileName);
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
                        "\r\n",
                        Convert(new string[,]{ { string.Empty } }),
                        2
                    });
                testCases.Add(
                    new object[]
                    {
                        "\r\n\r\n",
                        Convert(new string[,]{ { string.Empty }, { string.Empty } }),
                        4
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
                testCases.AddRange(
                    from escaped in ",\r\n\""
                    from field in ("ab" + escaped).Permute().Select(charList => new string(charList.ToArray()))
                    let file = "\"" + field.Replace("\"", "\"\"") + "\"\r\n"
                    select new object[]
                    {
                        file,
                        Convert(new string[,]{ { field } }),
                        file.Length
                    });

                testCases.Add(
                    new object[]
                    {
                        string.Empty,
                        Convert(new string[,]{}),
                        -1
                    });
                testCases.Add(
                    new object[]
                    {
                        "ab",
                        Convert(new string[,]{ { "ab" } }),
                        -3
                    });
                testCases.Add(
                    new object[]
                    {
                        "ab\r\ncd",
                        Convert(new string[,]{ { "ab" }, { "cd" } }),
                        -7
                    });
                testCases.Add(
                    new object[]
                    {
                        "ab,cd",
                        Convert(new string[,]{ { "ab", "cd" } }),
                        -6
                    });
                testCases.Add(
                    new object[]
                    {
                        "ab,cd\r\nef,gh",
                        Convert(new string[,]{ { "ab", "cd" }, { "ef", "gh" } }),
                        -13
                    });
                testCases.Add(
                    new object[]
                    {
                        "\na",
                        Convert(new string[,]{ { string.Empty } }),
                        -1
                    });
                testCases.Add(
                    new object[]
                    {
                        "a\n",
                        Convert(new string[,]{ { "a" } }),
                        -2
                    });
                testCases.Add(
                    new object[]
                    {
                        "\"",
                        Convert(new string[,]{ { string.Empty } }),
                        -1
                    });
                testCases.Add(
                   new object[]
                   {
                        "\"a\"b",
                        Convert(new string[,]{ { "a" } }),
                        -4
                   });
                testCases.Add(
                    new object[]
                    {
                        "a\"",
                        Convert(new string[,]{ { "a" } }),
                        -2
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
    }
}
