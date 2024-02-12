using Process.Definition;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Process
{
    internal class Constructor: ISelector<Func<Guid, Process, IDictionary<string, object>, Process>>
    {
        Func<Guid, Process, IDictionary<string, object>, Process> ISelector<Func<Guid, Process, IDictionary<string, object>, Process>>.Select(
            Definition.Sequence definition
            ) => (
                Guid                        id,
                Process                     parent,
                IDictionary<string, object> variables
                ) => new Sequence(
                    id,
                    definition,
                    parent,
                    variables);

        Func<Guid, Process, IDictionary<string, object>, Process> ISelector<Func<Guid, Process, IDictionary<string, object>, Process>>.Select(
            Definition.Parallel definition
            ) => (
                Guid                        id,
                Process                     parent,
                IDictionary<string, object> variables
                ) => new Parallel(
                    id,
                    definition,
                    parent,
                    variables);

        Func<Guid, Process, IDictionary<string, object>, Process> ISelector<Func<Guid, Process, IDictionary<string, object>, Process>>.Select(
            Definition.Choice definition
            ) => (
                Guid                        id,
                Process                     parent,
                IDictionary<string, object> variables
                ) => new Choice(
                    id,
                    definition,
                    parent,
                    variables);

        Func<Guid, Process, IDictionary<string, object>, Process> ISelector<Func<Guid, Process, IDictionary<string, object>, Process>>.Select(
            Definition.Input definition
            ) => (
                Guid                        id,
                Process                     parent,
                IDictionary<string, object> variables
                ) => new Input(
                    id,
                    definition,
                    parent,
                    variables);

        Func<Guid, Process, IDictionary<string, object>, Process> ISelector<Func<Guid, Process, IDictionary<string, object>, Process>>.Select(
            Definition.Output definition
            ) => (
                Guid                        id,
                Process                     parent,
                IDictionary<string, object> variables
                ) => new Output(
                    id,
                    definition,
                    parent,
                    variables);

        Func<Guid, Process, IDictionary<string, object>, Process> ISelector<Func<Guid, Process, IDictionary<string, object>, Process>>.Select(
            Definition.GuardedProcess definition
            ) => (
                Guid                        id,
                Process                     parent,
                IDictionary<string, object> variables
                ) => new GuardedProcess(
                    id,
                    definition,
                    (Choice)parent,
                    variables);

        Func<Guid, Process, IDictionary<string, object>, Process> ISelector<Func<Guid, Process, IDictionary<string, object>, Process>>.Select(
            Definition.While definition
            ) => (
                Guid                        id,
                Process                     parent,
                IDictionary<string, object> variables
                ) => new While(
                    id,
                    definition,
                    parent,
                    variables);

        Func<Guid, Process, IDictionary<string, object>, Process> ISelector<Func<Guid, Process, IDictionary<string, object>, Process>>.Select(
            SequenceForEach definition
            ) => (
                Guid                        id,
                Process                     parent,
                IDictionary<string, object> variables
                ) => new Sequence(
                    id,
                    definition,
                    parent,
                    variables);

        Func<Guid, Process, IDictionary<string, object>, Process> ISelector<Func<Guid, Process, IDictionary<string, object>, Process>>.Select(
            ParallelForEach definition
            ) => (
                Guid                        id,
                Process                     parent,
                IDictionary<string, object> variables
                ) => new Parallel(
                    id,
                    definition,
                    parent,
                    variables);

        Func<Guid, Process, IDictionary<string, object>, Process> ISelector<Func<Guid, Process, IDictionary<string, object>, Process>>.Select(
            ChoiceForEach definition
            ) => (
                Guid id,
                Process parent,
                IDictionary<string, object> variables
                ) => new Choice(
                    id,
                    definition,
                    parent,
                    variables);
    }
}
