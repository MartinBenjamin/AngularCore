using NUnit.Framework;
using System.Collections.Generic;
using System.Diagnostics;
using System.Numerics;

namespace Test
{
    [TestFixture]
    public class TestLevel3: Test
    {
        private static string _impossible = "impossible";
        private BigInteger Cycles(
            BigInteger x,
            BigInteger y
            )
        {
            BigInteger cycles = 0;

            while(true)
            {
                if(x == y)
                    return x == 1 ? cycles : -1;

                if(x > y)
                {
                    if(y == 1)
                    {
                        cycles += x - 1;
                        x = 1;
                    }
                    else
                    {
                        cycles += x / y;
                        x = x % y;
                        if(x == 0)
                            return -1;
                    }
                }
                else if(y > x)
                {
                    if(x == 1)
                    {
                        cycles += y - 1;
                        y = 1;
                    }
                    else
                    {
                        cycles += y / x;
                        y = y % x;
                        if(y == 0)
                            return -1;
                    }
                }
            }
        }

        [TestCaseSource("TestCases")]
        public void Test(
            string x,
            string y,
            string expected
            )
        {
            var stopwatch = new Stopwatch();
            stopwatch.Start();
            var result = Cycles(
                BigInteger.Parse(x),
                BigInteger.Parse(y));
            stopwatch.Stop();
            TestContext.WriteLine(stopwatch.ElapsedMilliseconds);
            if(expected == _impossible)
                Assert.That(result, Is.EqualTo(new BigInteger(-1)));

            else
                Assert.That(result, Is.EqualTo(BigInteger.Parse(expected)));
        }

        public static IEnumerable<object[]> TestCases
        {
            get
            {
                return new List<object[]>
                {
                    new object[]
                    {
                        "2",
                        "1",
                        "1"
                    },
                    new object[]
                    {
                        "5",
                        "1",
                        "4"
                    },
                    new object[]
                    {
                        "4",
                        "5",
                        "4"
                    },
                    new object[]
                    {
                        "7",
                        "4",
                        "4"
                    },
                    new object[]
                    {
                        "3",
                        "7",
                        "4"
                    },
                    new object[]
                    {
                        "8",
                        "3",
                        "4"
                    },
                    new object[]
                    {
                        "5",
                        "8",
                        "4"
                    },
                    new object[]
                    {
                        "7",
                        "5",
                        "4"
                    },
                    new object[]
                    {
                        "2",
                        "7",
                        "4"
                    },
                    new object[]
                    {
                        "7",
                        "2",
                        "4"
                    },
                    new object[]
                    {
                        "5",
                        "7",
                        "4"
                    },
                    new object[]
                    {
                        "8",
                        "5",
                        "4"
                    },
                    new object[]
                    {
                        "3",
                        "8",
                        "4"
                    },
                    new object[]
                    {
                        "7",
                        "3",
                        "4"
                    },
                    new object[]
                    {
                        "4",
                        "7",
                        "4"
                    },
                    new object[]
                    {
                        "5",
                        "4",
                        "4"
                    },
                    new object[]
                    {
                        "1",
                        "5",
                        "4"
                    },
                    new object[]
                    {
                        "2",
                        "4",
                        _impossible
                    },
                    new object[]
                    {
                        "10",
                        "1",
                        "9"
                    },
                    new object[]
                    {
                        "1000",
                        "1",
                        "999"
                    },
                    new object[]
                    {
                        "10000",
                        "1",
                        "9999"
                    },
                    new object[]
                    {
                        "100000",
                        "1",
                        "99999"
                    },
                    new object[]
                    {
                        "1000000",
                        "1",
                        "999999"
                    },
                    new object[]
                    {
                        "10000000",
                        "1",
                        "9999999"
                    },
                    new object[]
                    {
                        "100000000",
                        "1",
                        "99999999"
                    },
                    new object[]
                    {
                        "100000000000000000000000000000000000000000000000000",
                        "1",
                        "99999999999999999999999999999999999999999999999999"
                    }
                };
            }
        }
    }
}
