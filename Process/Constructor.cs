using Process.Definition;
using System;
using System.Collections.Generic;

namespace Process
{
    public class Constructor: ISelector<Func<Process, IDictionary<string, object>, Process>>
    {
        private readonly IIdService<Guid> _idService;

        public Constructor(
            IIdService<Guid> idService
            )
        {
            _idService = idService;
        }

        Func<Process, IDictionary<string, object>, Process> ISelector<Func<Process, IDictionary<string, object>, Process>>.Select(
            Definition.Sequence definition
            ) => (
                Process                     parent,
                IDictionary<string, object> variables
                ) => new Sequence(
                    _idService.NewId(),
                    definition,
                    parent,
                    variables);

        Func<Process, IDictionary<string, object>, Process> ISelector<Func<Process, IDictionary<string, object>, Process>>.Select(
            Definition.Parallel definition
            ) => (
                Process                     parent,
                IDictionary<string, object> variables
                ) => new Parallel(
                    _idService.NewId(),
                    definition,
                    parent,
                    variables);

        Func<Process, IDictionary<string, object>, Process> ISelector<Func<Process, IDictionary<string, object>, Process>>.Select(
            Definition.Choice definition
            ) => (
                Process                     parent,
                IDictionary<string, object> variables
                ) => new Choice(
                    _idService.NewId(),
                    definition,
                    parent,
                    variables);

        Func<Process, IDictionary<string, object>, Process> ISelector<Func<Process, IDictionary<string, object>, Process>>.Select(
            Definition.Input definition
            ) => (
                Process                     parent,
                IDictionary<string, object> variables
                ) => new Input(
                    _idService.NewId(),
                    definition,
                    parent,
                    variables);

        Func<Process, IDictionary<string, object>, Process> ISelector<Func<Process, IDictionary<string, object>, Process>>.Select(
            Definition.Output definition
            ) => (
                Process                     parent,
                IDictionary<string, object> variables
                ) => new Output(
                    _idService.NewId(),
                    definition,
                    parent,
                    variables);

        Func<Process, IDictionary<string, object>, Process> ISelector<Func<Process, IDictionary<string, object>, Process>>.Select(
            Definition.GuardedProcess definition
            ) => (
                Process                     parent,
                IDictionary<string, object> variables
                ) => new GuardedProcess(
                    _idService.NewId(),
                    definition,
                    (Choice)parent,
                    variables);

        Func<Process, IDictionary<string, object>, Process> ISelector<Func<Process, IDictionary<string, object>, Process>>.Select(
            Definition.While definition
            ) => (
                Process                     parent,
                IDictionary<string, object> variables
                ) => new While(
                    _idService.NewId(),
                    definition,
                    parent,
                    variables);

        Func<Process, IDictionary<string, object>, Process> ISelector<Func<Process, IDictionary<string, object>, Process>>.Select(
            SequenceForEach definition
            ) => (
                Process                     parent,
                IDictionary<string, object> variables
                ) => new Sequence(
                    _idService.NewId(),
                    definition,
                    parent,
                    variables);

        Func<Process, IDictionary<string, object>, Process> ISelector<Func<Process, IDictionary<string, object>, Process>>.Select(
            ParallelForEach definition
            ) => (
                Process                     parent,
                IDictionary<string, object> variables
                ) => new Parallel(
                    _idService.NewId(),
                    definition,
                    parent,
                    variables);

        Func<Process, IDictionary<string, object>, Process> ISelector<Func<Process, IDictionary<string, object>, Process>>.Select(
            ChoiceForEach definition
            ) => (
                Process parent,
                IDictionary<string, object> variables
                ) => new Choice(
                    _idService.NewId(),
                    definition,
                    parent,
                    variables);
    }
}
