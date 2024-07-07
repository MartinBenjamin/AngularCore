using CommonDomainObjects;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Test
{
    using Process;
    using Process.Definition;
    using System.Runtime.CompilerServices;
    using Execution = Process.Execution;

    public class Channel: ITuple
    {
        public string Name { get; protected set; }

        int ITuple.Length => 1;

        object ITuple.this[int index]
        {
            get
            {
                if(index != 0)
                    throw new IndexOutOfRangeException();

                return Name;
            }
        }

        public Channel(
            string name
            )
        {
            Name = name;
        }

        public override bool Equals(
            object obj
            ) =>
            obj is Channel channel &&
            Name == channel.Name;

        public override int GetHashCode() => Name.GetHashCode();

        public override string ToString() => Name;

        public static implicit operator Func<IScope, Channel>(
            Channel channel
            ) => _ => channel;
    }

    [TestFixture]
    public class TestProcess
    {
        [TestCaseSource("ProcessTestCases")]
        public void Process(
            Process definition,
            string  trace,
            bool    pass
            )  
        {
            IRuntime runtime = new Execution.Runtime();
            var process = runtime.Run(definition);

            var index = 0;
            foreach(var channel in trace.Select(c => new Channel(c.ToString())))
            {
                if(index == trace.Length - 1 && !pass)
                    Assert.That(runtime.Inputs(channel).Contains(process), Is.False);

                else
                {
                    Assert.That(runtime.Inputs(channel).Contains(process), Is.True);
                    runtime.Input(
                        channel,
                        null);
                }
                index++;
            }
        }

        [Test]
        public void Input()
        {
            var channel  = new Channel("channel");
            const string variable = "target";
            const string value    = "value";
            var inputDefinition = new Input(
                 channel,
                 variable);

            Execution.IExecutionService service = new Execution.ExecutionService();
            var input = (Execution.Input)inputDefinition.Select(Execution.Constructor.Instance)(
                null,
                null);
            service.Execute(input);
            Assert.That(input.Status, Is.EqualTo(Execution.Status.Waiting));
            var synchronisation = service.SynchronisationService.Resolve(channel);
            Assert.That(synchronisation, Is.Not.Null);
            Assert.That(synchronisation.Inputs.Contains(input), Is.True);
            Assert.That(input[variable], Is.Null);
            input.Execute(
                service,
                value);
            Assert.That(input.Status, Is.EqualTo(Execution.Status.Executed));
            Assert.That(input[variable], Is.EqualTo(value));
        }

        [Test]
        public void Output()
        {
            var channel = new Channel("channel");
            const string value = "value";
            var outputDefinition = new Output(
                 channel,
                 _ => value);

            Execution.IExecutionService service = new Execution.ExecutionService();
            var output = (Execution.Output)outputDefinition.Select(Execution.Constructor.Instance)(
                null,
                null);
            service.Execute(output);
            Assert.That(output.Status, Is.EqualTo(Execution.Status.Waiting));
            var synchronisation = service.SynchronisationService.Resolve(channel);
            Assert.That(synchronisation, Is.Not.Null);
            Assert.That(synchronisation.Outputs.Contains(output), Is.True);
            output.Execute(
                service,
                out object outputValue);
            Assert.That(output.Status, Is.EqualTo(Execution.Status.Executed));
            Assert.That(outputValue, Is.EqualTo(value));
        }

        [Test]
        public void IO()
        {
            var channel = new Channel("channel");
            const string variable = "target";
            const string value = "value";
            var outputDefinition = new Output(
                channel,
                _ => value);
            var inputDefinition = new Input(
                channel,
                variable);

            Execution.IExecutionService service = new Execution.ExecutionService();
            var input = inputDefinition.Select(Execution.Constructor.Instance)(
                null,
                null);
            service.Execute(input);
            Assert.That(input.Status, Is.EqualTo(Execution.Status.Waiting));
            Assert.That(input[variable], Is.Null);
            var synchronisation = service.SynchronisationService.Resolve(channel);
            Assert.That(synchronisation, Is.Not.Null);
            Assert.That(synchronisation.Inputs.Contains(input), Is.True);

            var output = outputDefinition.Select(Execution.Constructor.Instance)(
                null,
                null);
            service.Execute(output);
            Assert.That(output.Status, Is.EqualTo(Execution.Status.Executed));
            Assert.That(input.Status, Is.EqualTo(Execution.Status.Executed));
            Assert.That(input[variable], Is.EqualTo(value));
        }

        [Test]
        public void IO2()
        {
            var channel = new Channel("channel");
            const string variable = "target";
            const string value = "value";
            var processDefinition = new Parallel(
                new Output(
                     channel,
                     _ => value),
                new Input(
                     channel,
                     variable));

            Execution.IExecutionService service = new Execution.ExecutionService();
            var trace = new List<(ITuple, object)>();
            service.Trace = (channel, value) => trace.Add((channel, value));
            var process = processDefinition.Select(Execution.Constructor.Instance)(
                null,
                null);
            Assert.That(trace.Count, Is.EqualTo(0));
            service.Execute(process);
            Assert.That(process.Status, Is.EqualTo(Execution.Status.Executed));
            Assert.That(trace.Count, Is.EqualTo(1));
            Assert.That(trace[0].Item1, Is.EqualTo(channel));
            Assert.That(trace[0].Item2, Is.EqualTo(value  ));
        }

        [Test]
        public void InfinitelyReplicated()
        {
            var a = new Channel("A");
            var b = new Channel("B");

            var definition = new Sequence(
                new ParallelForEach()
                {
                    Variables  = (_) => Enumerable.Repeat<IDictionary<string, object>>(null, 10),
                    Replicated = new Output(a, (_) => null)
                },
                new Input(b, "TargetVariable"));
            IRuntime runtime = new Execution.Runtime();
            var process = runtime.Run(definition);
            Assert.AreEqual(runtime.Outputs(a).Count(p => p == process), 10);
            Assert.AreEqual(runtime.Inputs(b).Count(p => p == process), 0);

            var infinitelyReplicated = new InfinitelyReplicated(
                new Input(a, "TargetVariable"),
                null);
            runtime.Run(infinitelyReplicated);
            Assert.AreEqual(runtime.Outputs(a).Count(p => p == process), 0);
            Assert.AreEqual(runtime.Inputs(b).Count(p => p == process), 1);
        }

        public static IEnumerable<object[]> ProcessTestCases
        {
            get
            {
                var targetVariable = string.Empty;
                var testCases = new List<object[]>();

                var sequence = "ABC";
                var processes = new List<Process>
                {
                    new Sequence(
                        sequence
                            .Select(c => c.ToString())
                            .Select(c => new Input(new Channel(c), targetVariable)).ToArray()),
                    new Sequence(
                        new Sequence(
                            sequence
                                .Take(sequence.Length - 1).Select(c => c.ToString())
                                .Select(c => new Input(new Channel(c), targetVariable)).ToArray()),
                        new Input(new Channel(sequence.Last().ToString()), targetVariable)),
                    new Sequence(
                        new Input(new Channel(sequence.First().ToString()), targetVariable),
                        new Sequence(
                            sequence
                                .Skip(1).Select(c => c.ToString())
                                .Select(c => new Input(new Channel(c), targetVariable)).ToArray()))
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
                processes = new[]
                {
                    new Parallel(
                        set
                            .Select(c => c.ToString())
                            .Select(c => new Input(new Channel(c), targetVariable)).ToArray()),
                    new Parallel(
                        new Parallel(
                            set
                                .Take(2).Select(c => c.ToString())
                                .Select(c => c.ToString()).Select(c => new Input(new Channel(c), targetVariable)).ToArray()),
                        new Input(new Channel(set.Last().ToString()), targetVariable)),
                    new Parallel(
                        new Input(new Channel(set.First().ToString()), targetVariable),
                        new Parallel(
                            set
                                .Skip(1).Select(c => c.ToString())
                                .Select(c => new Input(new Channel(c), targetVariable)).ToArray()))
                }.Select(
                    parallel => (Process)new Sequence
                    (
                        parallel,
                        new Input(new Channel("D"), targetVariable)
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

                processes = new List<Choice>
                {
                    new(
                        set
                            .Select(c => c.ToString())
                            .Select(c => new GuardedProcess(new Input(new Channel(c), targetVariable))).ToArray()),
                    new(
                        new Choice(
                            set
                                .Take(2).Select(c => c.ToString())
                                .Select(c => new GuardedProcess(new Input(new Channel(c), targetVariable))).ToArray()),
                        new GuardedProcess(new Input(new Channel(set.Last().ToString()), targetVariable))),
                    new(
                        new GuardedProcess(new Input(new Channel(set.First().ToString()), targetVariable)),
                        new Choice(
                            set
                                .Skip(1).Select(c => c.ToString())
                                .Select(c => new GuardedProcess(new Input(new Channel(c), targetVariable))).ToArray()))
                }.Select(
                    c => (Process)new Sequence
                    (
                        c,
                        new Input(new Channel("D"), targetVariable)
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

                var choice = new Choice(
                    next.Select(
                        pair => new GuardedProcess(
                            new Input(new Channel(pair.Key), targetVariable),
                            new Input(new Channel(pair.Value), targetVariable))).ToArray());

                var allowedTraces = next.Keys
                    .Select(key => key.ToString())
                    .Concat(
                        next.Select(
                            pair => string.Format(
                                "{0}{1}",
                                pair.Key,
                                pair.Value)));

                testCases.AddRange(
                    from first in next.Keys
                    from second in next.Values.Prepend(string.Empty)
                    let trace = first + second
                    select new object[]
                    {
                        choice,
                        trace,
                        allowedTraces.Contains(trace)
                    });

                var allowed = new Dictionary<string, Func<IScope, bool>>
                {
                    {"A", _ => true },
                    {"B", _ => false},
                };

                choice = new Choice(
                    next.Select(
                        pair => new GuardedProcess(
                            allowed[pair.Key],
                            new Input(new Channel(pair.Key  ), targetVariable),
                            new Input(new Channel(pair.Value), targetVariable))).ToArray());

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
