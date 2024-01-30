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
                            i.Channel.Name == c &&
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

        [TestCaseSource("ProcessTestCases1")]
        public void Process1(
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
                var channel = new global::Process.Channel(
                    c,
                    null);
                var synchronisation = service.SynchronisationService.Resolve(channel);

                if(index == trace.Length - 1 && !pass)
                    Assert.That(synchronisation.InputCount, Is.EqualTo(0));

                else
                {
                    Assert.That(synchronisation.InputCount, Is.GreaterThanOrEqualTo(0));
                    var outputDefinition = new Output(
                        new Channel(new ConstantExpression<string>(c), channel.Type),
                        new ConstantExpression<object>(null));
                    service.Execute(outputDefinition.New(null));
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
            var input = (global::Process.Input)inputDefinition.New(null);
            service.Execute(input);
            Assert.That(input.Status, Is.EqualTo(global::Process.Status.AwaitIO));
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
            var output = (global::Process.Output)outputDefinition.New(null);
            service.Execute(output);
            Assert.That(output.Status, Is.EqualTo(global::Process.Status.AwaitIO));
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
            var input = inputDefinition.New(null);
            service.Execute(input);
            Assert.That(input.Status, Is.EqualTo(global::Process.Status.AwaitIO));
            Assert.That(input[variable], Is.Null);
            Assert.That(service.SynchronisationService.AwaitIO.Any(c => c.Name == channel.Name.Evaluate(input)), Is.True);

            var output = outputDefinition.New(null);
            service.Execute(output);
            Assert.That(output.Status, Is.EqualTo(global::Process.Status.Executed));
            Assert.That(input.Status, Is.EqualTo(global::Process.Status.Executed));
            Assert.That(input[variable], Is.EqualTo(value));
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
                        sequence.Select(c => new IO(new Channel(new ConstantExpression<string>(c.ToString())))).ToArray()),
                    new Sequence(
                        new Sequence(
                            "AB".Select(c => new IO(new Channel(new ConstantExpression<string>(c.ToString())))).ToArray()),
                        new IO(new Channel(new ConstantExpression<string>("C")))),
                    new Sequence(
                        new IO(new Channel(new ConstantExpression<string>("A"))),
                        new Sequence(
                            "BC".Select(c => new IO(new Channel(new ConstantExpression<string>(c.ToString())))).ToArray()))
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
                        set.Select(c => new IO(new Channel(new ConstantExpression<string>(c.ToString())))).ToArray()),
                    new Parallel(
                        new Parallel(
                            "AB".Select(c => new IO(new Channel(new ConstantExpression<string>(c.ToString())))).ToArray()),
                        new IO(new Channel(new ConstantExpression<string>("C")))),
                    new Parallel(
                        new IO(new Channel(new ConstantExpression<string>("A"))),
                        new Parallel(
                            "BC".Select(c => new IO(new Channel(new ConstantExpression<string>(c.ToString())))).ToArray()))
                }.Select(
                    parallel => (Process)new Sequence
                    (
                        parallel,
                        new IO(new Channel(new ConstantExpression<string>("D")))
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
                            c => new GuardedProcess(new IO(new Channel(new ConstantExpression<string>(c.ToString()))))).ToArray()),
                    new Choice(
                        new Choice(
                            "AB".Select(c => new GuardedProcess(new IO(new Channel(new ConstantExpression<string>(c.ToString()))))).ToArray()),
                        new GuardedProcess(new IO(new Channel(new ConstantExpression<string>("C"))))),
                    new Choice(
                        new GuardedProcess(new IO(new Channel(new ConstantExpression<string>("A")))),
                        new Choice(
                            "BC".Select(c => new GuardedProcess(new IO(new Channel(new ConstantExpression<string>(c.ToString()))))).ToArray()))
                }.Select(
                    c => (Process)new Sequence
                    (
                        c,
                        new IO(new Channel(new ConstantExpression<string>("D")))
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
                            new IO(new Channel(new ConstantExpression<string>(pair.Key))),
                            new IO(new Channel(new ConstantExpression<string>(pair.Value))))).ToArray());

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
                            new IO(new Channel(new ConstantExpression<string>(pair.Key))),
                            new IO(new Channel(new ConstantExpression<string>(pair.Value))))).ToArray());

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
        
        public static IEnumerable<object[]> ProcessTestCases1
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

                //var next = new Dictionary<string, string>
                //{
                //    {"A", "X"},
                //    {"B", "Y"}
                //};

                //var choice = new Choice(
                //    next.Select(
                //        pair => new GuardedProcess(
                //            new IO(new Channel(new ConstantExpression<string>(pair.Key))),
                //            new IO(new Channel(new ConstantExpression<string>(pair.Value))))).ToArray());

                //var allowedTraces = next.Keys
                //    .Select(key => key.ToString())
                //    .Concat(
                //        next.Select(
                //            pair => string.Format(
                //                "{0}{1}",
                //                pair.Key,
                //                pair.Value)));

                //testCases.AddRange(
                //    from first in next.Keys
                //    from second in next.Values.Prepend(string.Empty)
                //    let trace = first + second
                //    select new object[]
                //    {
                //        choice,
                //        trace,
                //        allowedTraces.Contains(trace)
                //    });

                //var allowed = new Dictionary<string, IExpression<bool>>
                //{
                //    {"A", new ConstantExpression<bool>(true )},
                //    {"B", new ConstantExpression<bool>(false)},
                //};

                //choice = new Choice(
                //    next.Select(
                //        pair => new GuardedProcess(
                //            allowed[pair.Key],
                //            new IO(new Channel(new ConstantExpression<string>(pair.Key))),
                //            new IO(new Channel(new ConstantExpression<string>(pair.Value))))).ToArray());

                //testCases.AddRange(
                //    new List<object[]>
                //    {
                //        new object[]{choice, "A" , true },
                //        new object[]{choice, "AX", true },
                //        new object[]{choice, "B" , false}
                //    });

                return testCases;
            }
        }
    }
}
