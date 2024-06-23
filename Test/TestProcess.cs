using CommonDomainObjects;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Test
{
    using Process.Definition;
    using Execution = Process.Execution;

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
            Execution.IExecutionService service = new Execution.ExecutionService();
            var process = definition.Select(Execution.Constructor.Instance)(
                null,
                null);
            service.Execute(process);

            var outputDefinition = new Output(
                scope => (Channel)scope["channel"],
                _ => null);

            var index = 0;
            foreach(var channel in trace.Select(c => new Channel(c.ToString(), null)))
            {
                var synchronisation = service.SynchronisationService.Resolve(channel);
                Assert.That(synchronisation, Is.Not.Null);

                if(index == trace.Length - 1 && !pass)
                    Assert.That(synchronisation.Inputs.Any(next => next.UltimateParent == process), Is.False);

                else
                {
                    Assert.That(synchronisation.Inputs.Any(next => next.UltimateParent == process), Is.True);
                    var output = outputDefinition.Select(Execution.Constructor.Instance)(
                        null,
                        new Dictionary<string, object> { { "channel", channel } });
                    service.Execute(output);
                }
                index++;
            }
        }

        [Test]
        public void Input()
        {
            var channel  = new Channel("channel", typeof(string));
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
            input.Executelnput(
                service,
                value);
            Assert.That(input.Status, Is.EqualTo(Execution.Status.Executed));
            Assert.That(input[variable], Is.EqualTo(value));
        }

        [Test]
        public void Output()
        {
            var channel = new Channel("channel", typeof(string));
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
            var outputValue = output.ExecuteOutput(service);
            Assert.That(output.Status, Is.EqualTo(Execution.Status.Executed));
            Assert.That(outputValue, Is.EqualTo(value));
        }

        [Test]
        public void IO()
        {
            var channel = new Channel("channel", typeof(string));
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
            var channel = new Channel("channel", typeof(string));
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
            var trace = new List<(Channel, object)>();
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

                processes = new List<Process>
                {
                    new Choice(
                        set
                            .Select(c => c.ToString())
                            .Select(c => new GuardedProcess(new Input(new Channel(c), targetVariable))).ToArray()),
                    new Choice(
                        new Choice(
                            set
                                .Take(2).Select(c => c.ToString())
                                .Select(c => new GuardedProcess(new Input(new Channel(c), targetVariable))).ToArray()),
                        new GuardedProcess(new Input(new Channel(set.Last().ToString()), targetVariable))),
                    new Choice(
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
