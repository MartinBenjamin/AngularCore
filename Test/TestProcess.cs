using CommonDomainObjects;
using NUnit.Framework;
using Process;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using Definition = Process.Definition;

namespace Test
{
    [TestFixture]
    public class TestProcess
    {
        [TestCaseSource("ProcessTestCases")]
        public void Process(
            Definition.Process definition,
            string             trace,
            bool               pass
            )  
        {
            IExecutionService service = new ExecutionService();
            var process = definition.New(null);
            service.Execute(process);

            var index = 0;
            foreach(var c in trace.Select(c => c.ToString()))
            {
                var io = process
                    .OfType<IO>()
                    .FirstOrDefault(
                        i =>
                            ((Definition.IO)i.Definition).Channel.Evaluate(i) == c &&
                            i.Status == Status.AwaitIO);

                if(index == trace.Length - 1 && !pass)
                    Assert.That(io, Is.Null);

                else
                {
                    Assert.That(io, Is.Not.Null);
                    io.ExecuteIO(service);
                }
                index++;
            }
        }

        public static IEnumerable<object[]> ProcessTestCases
        {
            get
            {
                var testCases = new List<object[]>();

                var sequence = "ABC";
                var processes = new List<Definition.Process>
                {
                    new Definition.Sequence(
                        sequence.Select(c => new Definition.IO(c.ToString())).ToArray()),
                    new Definition.Sequence(
                        new Definition.Sequence(
                            "AB".Select(c => new Definition.IO(c.ToString())).ToArray()),
                        new Definition.IO("C")),
                    new Definition.Sequence(
                        new Definition.IO("A"),
                        new Definition.Sequence(
                            "BC".Select(c => new Definition.IO(c.ToString())).ToArray()))
                };

                testCases.AddRange(
                    from process in processes
                    from length in Enumerable.Range(0, sequence.Length)
                    from last in sequence
                    let trace = sequence.Substring(0, length) + last
                    select new object[]
                    {
                        process,
                        trace,
                        sequence.StartsWith(trace)
                    });

                var set = "ABC";
                processes = new []
                {
                    new Definition.Parallel(
                        set.Select(c => new Definition.IO(c.ToString())).ToArray()),
                    new Definition.Parallel(
                        new Definition.Parallel(
                            "AB".Select(c => new Definition.IO(c.ToString())).ToArray()),
                        new Definition.IO("C")),
                    new Definition.Parallel(
                        new Definition.IO("A"),
                        new Definition.Parallel(
                            "BC".Select(c => new Definition.IO(c.ToString())).ToArray()))
                }.Select(
                    parallel => (Definition.Process)new Definition.Sequence
                    (
                        parallel,
                        new Definition.IO("D")
                    )).ToList();

                var permutations = set.Permute().Select(p => new string(p.ToArray()));

                testCases.AddRange(
                    from process in processes
                    from length in Enumerable.Range(0, set.Length + 1)
                    from permutation in permutations.Select(p => p.Substring(0, length)).Distinct()
                    let trace = permutation + 'D'
                    select new object[]
                    {
                        process,
                        trace,
                        permutation.Length == set.Length
                    });

                processes = new List<Definition.Process>
                {
                    new Definition.Choice(
                        set.Select(
                            c => new Definition.GuardedProcess(new Definition.IO(c.ToString()))).ToArray()),
                    new Definition.Choice(
                        new Definition.Choice(
                            "AB".Select(c => new Definition.GuardedProcess(new Definition.IO(c.ToString()))).ToArray()),
                        new Definition.GuardedProcess(new Definition.IO("C"))),
                    new Definition.Choice(
                        new Definition.GuardedProcess(new Definition.IO("A")),
                        new Definition.Choice(
                            "BC".Select(c => new Definition.GuardedProcess(new Definition.IO(c.ToString()))).ToArray()))
                }.Select(
                    c => (Definition.Process)new Definition.Sequence
                    (
                        c,
                        new Definition.IO("D")
                    )).ToList();

                testCases.AddRange(
                    from process in processes
                    from first in set.Append('D')
                    select new object[]
                    {
                        process,
                        first.ToString(),
                        first != 'D'
                    });

                testCases.AddRange(
                    from process in processes
                    from first in set
                    from second in set.Append('D')
                    select new object[]
                    {
                        process,
                        first.ToString() + second,
                        second == 'D'
                    });

                var next = new Dictionary<string, string>
                {
                    {"A", "X"},
                    {"B", "Y"}
                };

                var choice = new Definition.Choice(
                    next.Select(
                        pair => new Definition.GuardedProcess(
                            new Definition.IO(pair.Key),
                            new Definition.IO(pair.Value))).ToArray());

                var allowedTraces = next.Keys
                    .Select(key => key.ToString())
                    .Concat(
                        next.Select(
                            pair => string.Format(
                                "{0}{1}",
                                pair.Key,
                                pair.Value)));

                testCases.AddRange(
                    from first in next.Keys.Select(c => c.ToString())
                    from second in next.Values.Select(c => c.ToString()).Prepend(string.Empty)
                    let trace = first + second
                    select new object[]
                    {
                        choice,
                        trace,
                        allowedTraces.Contains(trace)
                    });

                var allowed = new Dictionary<string, Expression<Func<Process.Process, bool>>>
                {
                    {"A", p => true },
                    {"B", p => false},
                };

                choice = new Definition.Choice(
                    next.Select(
                        pair => new Definition.GuardedProcess(
                            allowed[pair.Key],
                            new Definition.IO(pair.Key),
                            new Definition.IO(pair.Value))).ToArray());

                testCases.AddRange(
                    new List<object[]>
                    {
                        new object[]{choice, "A" , true },
                        new object[]{choice, "AX", true },
                        new object[]{choice, "B" , false}
                    });

                return testCases;
            }
        }
    }
}
