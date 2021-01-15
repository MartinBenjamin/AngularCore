using NUnit.Framework;
using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.Text;
using System.Linq;

namespace Test
{

    [TestFixture]
    public class TestSolution: Test
    {
        private bool IsPrime(
            int n
            )
        {
            if(n <= 3)
                return n > 1;

            if(n % 2 == 0)
                return false;

            if(n % 3 == 0)
                return false;

            int maxDivisor = (int)Math.Floor(Math.Sqrt(n));

            var adjustments = new int[] { 0, 2 };
            for(int divisor = 5;divisor <= maxDivisor;divisor += 6)
                foreach(var adjustment in adjustments)
                    if(n % (divisor + adjustment) == 0)
                        return false;

            return true;
        }

        private string GenerateId(
            int index
            )
        {
            var builder = new StringBuilder(10010);
            var n = 0;
            while(true)
            {
                if(IsPrime(n))
                    builder.Append(n.ToString());

                if(builder.Length >= index + 5)
                    return builder.ToString().Substring(index, 5);

                n += 1;
            }                
        }

        private string GenerateId2(
            int index
            )
        {
            var primes = new List<int>();
            var builder = new StringBuilder(10010);

            var n = 2;
            primes.Add(n);
            builder.Append(n.ToString());

            n += 1;
            while(true)
            {
                if(primes.All(prime => n % prime != 0))                   
                {
                    primes.Add(n);
                    builder.Append(n.ToString());

                    if(builder.Length >= index + 5)
                        return builder.ToString().Substring(index, 5);

                }
                n += 1;
            }
        }

        [TestCase( 1, false)]
        [TestCase( 2, true)]
        [TestCase( 3, true)]
        [TestCase( 4, false)]
        [TestCase( 5, true)]
        [TestCase( 6, false)]
        [TestCase( 7, true)]
        [TestCase( 8, false)]
        [TestCase( 9, false)]
        [TestCase(10, false)]
        [TestCase(11, true)]
        [TestCase(12, false)]
        [TestCase(13, true)]
        [TestCase(14, false)]
        [TestCase(15, false)]
        [TestCase(16, false)]
        [TestCase(17, true)]
        [TestCase(25, false)]
        public void IsPrime(
            int  n,
            bool expected
            )
        {
            Assert.That(IsPrime(n), Is.EqualTo(expected));
        }

        [TestCase(    0, "23571")]
        [TestCase(    3, "71113")]
        [TestCase(10000, "02192")]
        public void GenerateId(
            int index,
            string expected
            )
        {
            var stopwatch = new Stopwatch();
            stopwatch.Start();
            Assert.That(GenerateId(index), Is.EqualTo(expected));
            stopwatch.Stop();
            TestContext.WriteLine(stopwatch.ElapsedTicks);
            TestContext.WriteLine(stopwatch.ElapsedMilliseconds);
            stopwatch.Reset();
            stopwatch.Start();
            Assert.That(GenerateId2(index), Is.EqualTo(expected));
            stopwatch.Stop();
            TestContext.WriteLine(stopwatch.ElapsedTicks);
            TestContext.WriteLine(stopwatch.ElapsedMilliseconds);
        }
    }
}
