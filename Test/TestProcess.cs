using CommonDomainObjects;
using NUnit.Framework;
using Process.Expression;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Test
{
    using Process.Definition;

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
            global::Process.IExecutionService service = new global::Process.ExecutionService();
            var process = definition.Select(service.Constructor)(
                null,
                null);
            service.Execute(process);

            var outputDefinition = new Output(
                new Channel(new VariableExpression<string>("channel")),
                new ConstantExpression<object>(null));

            var index = 0;
            foreach(var c in trace.Select(c => c.ToString()))
            {
                var channel = new global::Process.Channel(
                    c,
                    null);
                var synchronisation = service.SynchronisationService.Resolve(channel);

                if(index == trace.Length - 1 && !pass)
                    Assert.That(synchronisation.InputCount, Is.EqualTo(0));

                else
                {
                    Assert.That(synchronisation.InputCount, Is.GreaterThanOrEqualTo(0));
                    var output = outputDefinition.Select(service.Constructor)(
                        null,
                        new Dictionary<string, object> { { "channel", c } });
                    service.Execute(output);
                }
                index++;
            }
        }

        [Test]
        public void Input()
        {
            var channel  = new Channel(new ConstantExpression<string>("channel"), typeof(string));
            const string variable = "target";
            const string value    = "value";
            var inputDefinition = new Input(
                 channel,
                 variable);

            global::Process.IExecutionService service = new global::Process.ExecutionService();
            var input = (global::Process.Input)inputDefinition.Select(service.Constructor)(
                null,
                null);
            service.Execute(input);
            Assert.That(input.Status, Is.EqualTo(global::Process.Status.Waiting));
            Assert.That(service.SynchronisationService.AwaitIO.Any(c => c.Name == channel.Name.Evaluate(input)), Is.True);
            Assert.That(input[variable], Is.Null);
            input.Executelnput(
                service,
                value);
            Assert.That(input.Status, Is.EqualTo(global::Process.Status.Executed));
            Assert.That(input[variable], Is.EqualTo(value));
        }

        [Test]
        public void Output()
        {
            var channel = new Channel(new ConstantExpression<string>("channel"), typeof(string));
            const string value = "value";
            var outputDefinition = new Output(
                 channel,
                 new ConstantExpression<string>(value));

            global::Process.IExecutionService service = new global::Process.ExecutionService();
            var output = (global::Process.Output)outputDefinition.Select(service.Constructor)(
                null,
                null);
            service.Execute(output);
            Assert.That(output.Status, Is.EqualTo(global::Process.Status.Waiting));
            Assert.That(service.SynchronisationService.AwaitIO.Any(c => c.Name == channel.Name.Evaluate(output)), Is.True);
            var outputValue = output.ExecuteOutput(service);
            Assert.That(output.Status, Is.EqualTo(global::Process.Status.Executed));
            Assert.That(outputValue, Is.EqualTo(value));
        }

        [Test]
        public void IO()
        {
            var channel = new Channel(new ConstantExpression<string>("channel"), typeof(string));
            const string variable = "target";
            const string value = "value";
            var outputDefinition = new Output(
                 channel,
                 new ConstantExpression<string>(value));
            var inputDefinition = new Input(
                 channel,
                 variable);

            global::Process.IExecutionService service = new global::Process.ExecutionService();
            var input = inputDefinition.Select(service.Constructor)(
                null,
                null);
            service.Execute(input);
            Assert.That(input.Status, Is.EqualTo(global::Process.Status.Waiting));
            Assert.That(input[variable], Is.Null);
            Assert.That(service.SynchronisationService.AwaitIO.Any(c => c.Name == channel.Name.Evaluate(input)), Is.True);

            var output = outputDefinition.Select(service.Constructor)(
                null,
                null);
            service.Execute(output);
            Assert.That(output.Status, Is.EqualTo(global::Process.Status.Executed));
            Assert.That(input.Status, Is.EqualTo(global::Process.Status.Executed));
            Assert.That(input[variable], Is.EqualTo(value));
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
                            .Select(c => new Input(new Channel(new ConstantExpression<string>(c)), targetVariable)).ToArray()),
                    new Sequence(
                        new Sequence(
                            sequence
                                .Take(sequence.Length - 1).Select(c => c.ToString())
                                .Select(c => new Input(new Channel(new ConstantExpression<string>(c)), targetVariable)).ToArray()),
                        new Input(new Channel(new ConstantExpression<string>(sequence.Last().ToString())), targetVariable)),
                    new Sequence(
                        new Input(new Channel(new ConstantExpression<string>(sequence.First().ToString())), targetVariable),
                        new Sequence(
                            sequence
                                .Skip(1).Select(c => c.ToString())
                                .Select(c => new Input(new Channel(new ConstantExpression<string>(c)), targetVariable)).ToArray()))
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
                            .Select(c => new Input(new Channel(new ConstantExpression<string>(c)), targetVariable)).ToArray()),
                    new Parallel(
                        new Parallel(
                            set
                                .Take(2).Select(c => c.ToString())
                                .Select(c => c.ToString()).Select(c => new Input(new Channel(new ConstantExpression<string>(c)), targetVariable)).ToArray()),
                        new Input(new Channel(new ConstantExpression<string>(set.Last().ToString())), targetVariable)),
                    new Parallel(
                        new Input(new Channel(new ConstantExpression<string>(set.First().ToString())), targetVariable),
                        new Parallel(
                            set
                                .Skip(1).Select(c => c.ToString())
                                .Select(c => new Input(new Channel(new ConstantExpression<string>(c)), targetVariable)).ToArray()))
                }.Select(
                    parallel => (Process)new Sequence
                    (
                        parallel,
                        new Input(new Channel(new ConstantExpression<string>("D")), targetVariable)
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
                            .Select(c => new GuardedProcess(new Input(new Channel(new ConstantExpression<string>(c)), targetVariable))).ToArray()),
                    new Choice(
                        new Choice(
                            set
                                .Take(2).Select(c => c.ToString())
                                .Select(c => new GuardedProcess(new Input(new Channel(new ConstantExpression<string>(c)), targetVariable))).ToArray()),
                        new GuardedProcess(new Input(new Channel(new ConstantExpression<string>(set.Last().ToString())), targetVariable))),
                    new Choice(
                        new GuardedProcess(new Input(new Channel(new ConstantExpression<string>(set.First().ToString())), targetVariable)),
                        new Choice(
                            set
                                .Skip(1).Select(c => c.ToString())
                                .Select(c => new GuardedProcess(new Input(new Channel(new ConstantExpression<string>(c)), targetVariable))).ToArray()))
                }.Select(
                    c => (Process)new Sequence
                    (
                        c,
                        new Input(new Channel(new ConstantExpression<string>("D")), targetVariable)
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
                            new Input(new Channel(new ConstantExpression<string>(pair.Key  )), targetVariable),
                            new Input(new Channel(new ConstantExpression<string>(pair.Value)), targetVariable))).ToArray());

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

                var allowed = new Dictionary<string, bool>
                {
                    {"A", true },
                    {"B", false},
                };

                choice = new Choice(
                    next.Select(
                        pair => new GuardedProcess(
                            new ConstantExpression<bool>(allowed[pair.Key]),
                            new Input(new Channel(new ConstantExpression<string>(pair.Key  )), targetVariable),
                            new Input(new Channel(new ConstantExpression<string>(pair.Value)), targetVariable))).ToArray());

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
