using CommonDomainObjects;
using Process;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using Definition = global::Process.Definition;

namespace Test
{
    [TestFixture]
    public class TestProcess
    {
        private class LabelledInput<TLabel>: Input
        {
            public TLabel Label { get; protected set; }

            public LabelledInput(
                LabelledInputDefinition<TLabel> definition,
                Process.Process                 parent
                )
                : base(definition, parent)
            {
                Label = definition.Label;
            }

            protected override void ExecuteInput()
            {
            }
        }

        private class LabelledInputDefinition<TLabel>: Definition.Input
        {
            public TLabel Label { get; protected set; }

            public LabelledInputDefinition(
                TLabel label
                )
            {
                Label = label;
            }

            public override Process.Process New(
                Process.Process parent
                )
            {
                return new LabelledInput<TLabel>(
                    this,
                    parent);
            }

            public override void ToString(
                StringBuilder builder
                )
            {
                builder.Append(Label.ToString() + '?');
            }
        }

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
            foreach(var c in trace)
            {
                var input = process.Processes
                    .OfType<LabelledInput<char>>()
                    .FirstOrDefault(
                        i =>
                            i.Label  == c &&
                            i.Status == Status.AwaitIO);

                if(index == trace.Length - 1 && !pass)
                    Assert.That(input, Is.Null);

                else
                {
                    Assert.That(input, Is.Not.Null);
                    input.ExecuteInput(service);
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
                        sequence.Select(c => new LabelledInputDefinition<char>(c)).ToArray()),
                    new Definition.Sequence(
                        new Definition.Sequence(
                            "AB".Select(c => new LabelledInputDefinition<char>(c)).ToArray()),
                        new LabelledInputDefinition<char>('C')),
                    new Definition.Sequence(
                        new LabelledInputDefinition<char>('A'),
                        new Definition.Sequence(
                            "BC".Select(c => new LabelledInputDefinition<char>(c)).ToArray()))
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
                        set.Select(c => new LabelledInputDefinition<char>(c)).ToArray()),
                    new Definition.Parallel(
                        new Definition.Parallel(
                            "AB".Select(c => new LabelledInputDefinition<char>(c)).ToArray()),
                        new LabelledInputDefinition<char>('C')),
                    new Definition.Parallel(
                        new LabelledInputDefinition<char>('A'),
                        new Definition.Parallel(
                            "BC".Select(c => new LabelledInputDefinition<char>(c)).ToArray()))
                }.Select(
                    parallel => (Definition.Process)new Definition.Sequence
                    (
                        parallel,
                        new LabelledInputDefinition<char>('D')
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
                            c => new Definition.GuardedProcess(new LabelledInputDefinition<char>(c))).ToArray()),
                    new Definition.Choice(
                        new Definition.Choice(
                            "AB".Select(c => new Definition.GuardedProcess(new LabelledInputDefinition<char>(c))).ToArray()),
                        new Definition.GuardedProcess(new LabelledInputDefinition<char>('C'))),
                    new Definition.Choice(
                        new Definition.GuardedProcess(new LabelledInputDefinition<char>('A')),
                        new Definition.Choice(
                            "BC".Select(c => new Definition.GuardedProcess(new LabelledInputDefinition<char>(c))).ToArray()))
                }.Select(
                    c => (Definition.Process)new Definition.Sequence
                    (
                        c,
                        new LabelledInputDefinition<char>('D')
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

                var next = new Dictionary<char, char>
                {
                    {'A', 'X'},
                    {'B', 'Y'}
                };

                var choice = new Definition.Choice(
                    next.Select(
                        pair => new Definition.GuardedProcess(
                            new LabelledInputDefinition<char>(pair.Key),
                            new LabelledInputDefinition<char>(pair.Value))).ToArray());

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

                var allowed = new Dictionary<char, Expression<Func<global::Process.Process, bool>>>
                {
                    {'A', p => true },
                    {'B', p => false},
                };

                choice = new Definition.Choice(
                    next.Select(
                        pair => new Definition.GuardedProcess(
                            allowed[pair.Key],
                            new LabelledInputDefinition<char>(pair.Key),
                            new LabelledInputDefinition<char>(pair.Value))).ToArray());

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
