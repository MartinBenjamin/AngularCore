using Process.Definition;
using System;
using System.Collections.Generic;

namespace Process.Execution
{
    public class Constructor: ISelector<Func<Process, IDictionary<string, object>, Process>>
    {
        public static readonly Constructor Instance = new();

        private Constructor()
        { }

        Func<Process, IDictionary<string, object>, Process> ISelector<Func<Process, IDictionary<string, object>, Process>>.Select(
            Definition.Sequence definition
            ) => (
                Process                     parent,
                IDictionary<string, object> variables
                ) => new Sequence(
                    definition,
                    parent,
                    variables);

        Func<Process, IDictionary<string, object>, Process> ISelector<Func<Process, IDictionary<string, object>, Process>>.Select(
            Definition.Parallel definition
            ) => (
                Process                     parent,
                IDictionary<string, object> variables
                ) => new Parallel(
                    definition,
                    parent,
                    variables);

        Func<Process, IDictionary<string, object>, Process> ISelector<Func<Process, IDictionary<string, object>, Process>>.Select(
            Definition.Choice definition
            ) => (
                Process                     parent,
                IDictionary<string, object> variables
                ) => new Choice(
                    definition,
                    parent,
                    variables);

        Func<Process, IDictionary<string, object>, Process> ISelector<Func<Process, IDictionary<string, object>, Process>>.Select(
            Definition.Input definition
            ) => (
                Process                     parent,
                IDictionary<string, object> variables
                ) => new Input(
                    definition,
                    parent,
                    variables);

        Func<Process, IDictionary<string, object>, Process> ISelector<Func<Process, IDictionary<string, object>, Process>>.Select(
            Definition.Output definition
            ) => (
                Process                     parent,
                IDictionary<string, object> variables
                ) => new Output(
                    definition,
                    parent,
                    variables);

        Func<Process, IDictionary<string, object>, Process> ISelector<Func<Process, IDictionary<string, object>, Process>>.Select(
            Definition.GuardedProcess definition
            ) => (
                Process                     parent,
                IDictionary<string, object> variables
                ) => new GuardedProcess(
                    definition,
                    (Choice)parent,
                    variables);

        Func<Process, IDictionary<string, object>, Process> ISelector<Func<Process, IDictionary<string, object>, Process>>.Select(
            Definition.While definition
            ) => (
                Process                     parent,
                IDictionary<string, object> variables
                ) => new While(
                    definition,
                    parent,
                    variables);

        Func<Process, IDictionary<string, object>, Process> ISelector<Func<Process, IDictionary<string, object>, Process>>.Select(
             Definition.SequenceForEach definition
            ) => (
                Process                     parent,
                IDictionary<string, object> variables
                ) => new SequenceForEach(
                    definition,
                    parent,
                    variables);

        Func<Process, IDictionary<string, object>, Process> ISelector<Func<Process, IDictionary<string, object>, Process>>.Select(
            Definition.ParallelForEach definition
            ) => (
                Process                     parent,
                IDictionary<string, object> variables
                ) => new ParallelForEach(
                    definition,
                    parent,
                    variables);

        Func<Process, IDictionary<string, object>, Process> ISelector<Func<Process, IDictionary<string, object>, Process>>.Select(
            Definition.ChoiceForEach definition
            ) => (
                Process                     parent,
                IDictionary<string, object> variables
                ) => new ChoiceForEach(
                    definition,
                    parent,
                    variables);

        Func<Process, IDictionary<string, object>, Process> ISelector<Func<Process, IDictionary<string, object>, Process>>.Select(
            Definition.InfinitelyReplicated definition
            ) => (
                Process                     parent,
                IDictionary<string, object> variables
                ) => new GuardedProcess(
                    definition,
                    parent,
                    variables);
    }
}
