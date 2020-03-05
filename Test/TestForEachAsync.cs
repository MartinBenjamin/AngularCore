using CommonDomainObjects;
using NUnit.Framework;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace Test
{
    [TestFixture]
    public class TestForEachAsync
    {
        [TestCaseSource("ForEachAsyncTestCases")]
        public async Task ForEachAsync(
            string items,
            int    maxConcurrent,
            int    delay
            )
        {
            var trace = new List<char>();

            var stopwatch = new Stopwatch();
            stopwatch.Start();
            await items.ForEachAsync(
                async c =>
                {
                    if(delay > 0)
                        await Task.Delay(delay);

                    lock(trace)
                        trace.Add(c);
                },
                maxConcurrent);
            stopwatch.Stop();
            TestContext.Out.Write(stopwatch.ElapsedMilliseconds);

            Assert.That(trace.Count, Is.EqualTo(items.Length));
            Assert.That(new string(trace.OrderBy(c => c).ToArray()), Is.EqualTo(items));
        }

        public static IEnumerable<object[]> ForEachAsyncTestCases
        {
            get
            {
                var items = "ABCDEFGHIJ";
                return
                    from maxConcurrent in Enumerable.Range(1, items.Length + 1)
                    from delay in new[] { 0, 30 }
                    select new object[]
                    {
                        items,
                        maxConcurrent,
                        delay
                    };
            }
        }
    }
}
