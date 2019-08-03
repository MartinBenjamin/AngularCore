using CommonDomainObjects;
using NUnit.Framework;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace Test
{
    [TestFixture]
    public class TestDispatch
    {
        [TestCaseSource("DispatchTestCases")]
        public async Task Dispatch(
            string workItems,
            int    maxConcurrent,
            int    delay
            )
        {
            var trace = new List<char>();

            var stopwatch = new Stopwatch();
            stopwatch.Start();
            await workItems.Dispatch(
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

            Assert.That(trace.Count, Is.EqualTo(workItems.Length));
            Assert.That(new string(trace.OrderBy(c => c).ToArray()), Is.EqualTo(workItems));
        }

        public static IEnumerable<object[]> DispatchTestCases
        {
            get
            {
                var workItems = "ABCDEFGHIJ";
                return
                    from maxConcurrent in Enumerable.Range(1, workItems.Length + 1)
                    from delay in new[] { 0, 30 }
                    select new object[]
                    {
                        workItems,
                        maxConcurrent,
                        delay
                    };
            }
        }
    }
}
