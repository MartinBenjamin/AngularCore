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
            var process = definition.New(null);
            service.Execute(process);

            var index = 0;
            foreach(var c in trace.Select(c => c.ToString()))
            {
                var io = process
                    .OfType<global::Process.IO>()
                    .FirstOrDefault(
                        i =>
                            ((IO)i.Definition).Channel.Evaluate(i).Name == c &&
                            i.Status == global::Process.Status.AwaitIO);

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

        [Test]
        public void Input()
        {
            var channel  = new Channel("channel", typeof(string));
            const string variable = "target";
            const string value    = "value";
            var inputDefinition = new Input(
                 new ConstantExpression<Channel>(channel),
                 variable);

            global::Process.IExecutionService service = new global::Process.ExecutionService();
            var input = (global::Process.Input)inputDefinition.New(null);
            service.Execute(input);
            Assert.That(input.Status, Is.EqualTo(global::Process.Status.AwaitIO));
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
            var channel = new Channel("channel", typeof(string));
            const string value = "value";
            var outputDefinition = new Output(
                 new ConstantExpression<Channel>(channel),
                 new ConstantExpression<string>(value));

            global::Process.IExecutionService service = new global::Process.ExecutionService();
            var output = (global::Process.Output)outputDefinition.New(null);
            service.Execute(output);
            Assert.That(output.Status, Is.EqualTo(global::Process.Status.AwaitIO));
            var outputValue = output.ExecuteOutput(service);
            Assert.That(output.Status, Is.EqualTo(global::Process.Status.Executed));
            Assert.That(outputValue, Is.EqualTo(value));
        }

        public static IEnumerable<object[]> ProcessTestCases
        {
            get
            {
                var testCases = new List<object[]>();

                var sequence = "ABC";
                var processes = new List<Process>
                {
                    new Sequence(
                        sequence.Select(c => new IO(new ConstantExpression<Channel>(new Channel(c.ToString())))).ToArray()),
                    new Sequence(
                        new Sequence(
                            "AB".Select(c => new IO(new ConstantExpression<Channel>(new Channel(c.ToString())))).ToArray()),
                        new IO(new ConstantExpression<Channel>(new Channel("C")))),
                    new Sequence(
                        new IO(new ConstantExpression<Channel>(new Channel("A"))),
                        new Sequence(
                            "BC".Select(c => new IO(new ConstantExpression<Channel>(new Channel(c.ToString())))).ToArray()))
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
                    new Parallel(
                        set.Select(c => new IO(new ConstantExpression<Channel>(new Channel(c.ToString())))).ToArray()),
                    new Parallel(
                        new Parallel(
                            "AB".Select(c => new IO(new ConstantExpression<Channel>(new Channel(c.ToString())))).ToArray()),
                        new IO(new ConstantExpression<Channel>(new Channel("C")))),
                    new Parallel(
                        new IO(new ConstantExpression<Channel>(new Channel("A"))),
                        new Parallel(
                            "BC".Select(c => new IO(new ConstantExpression<Channel>(new Channel(c.ToString())))).ToArray()))
                }.Select(
                    parallel => (Process)new Sequence
                    (
                        parallel,
                        new IO(new ConstantExpression<Channel>(new Channel("D")))
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
                        set.Select(
                            c => new GuardedProcess(new IO(new ConstantExpression<Channel>(new Channel(c.ToString()))))).ToArray()),
                    new Choice(
                        new Choice(
                            "AB".Select(c => new GuardedProcess(new IO(new ConstantExpression<Channel>(new Channel(c.ToString()))))).ToArray()),
                        new GuardedProcess(new IO(new ConstantExpression<Channel>(new Channel("C"))))),
                    new Choice(
                        new GuardedProcess(new IO(new ConstantExpression<Channel>(new Channel("A")))),
                        new Choice(
                            "BC".Select(c => new GuardedProcess(new IO(new ConstantExpression<Channel>(new Channel(c.ToString()))))).ToArray()))
                }.Select(
                    c => (Process)new Sequence
                    (
                        c,
                        new IO(new ConstantExpression<Channel>(new Channel("D")))
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
                            new IO(new ConstantExpression<Channel>(new Channel(pair.Key))),
                            new IO(new ConstantExpression<Channel>(new Channel(pair.Value))))).ToArray());

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

                var allowed = new Dictionary<string, IExpression<bool>>
                {
                    {"A", new ConstantExpression<bool>(true )},
                    {"B", new ConstantExpression<bool>(false)},
                };

                choice = new Choice(
                    next.Select(
                        pair => new GuardedProcess(
                            allowed[pair.Key],
                            new IO(new ConstantExpression<Channel>(new Channel(pair.Key))),
                            new IO(new ConstantExpression<Channel>(new Channel(pair.Value))))).ToArray());

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
