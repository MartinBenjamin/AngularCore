﻿using Process.Definition;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Process
{
    internal class ReplayService: IExecutionService
    {
        private readonly ISynchronisationService _synchronisationService;
        private readonly Queue<IExecutable>      _queue = new();

        public ReplayService(
            ISynchronisationService synchronisationService
            )
        {
            _synchronisationService = synchronisationService;
        }

        Trace IExecutionService.Trace { get; set; }

        Guid IIdService<Guid>.NewId() => Guid.NewGuid();

        Definition.ISelector<Func<Process, IDictionary<string, object>, Process>> IExecutionService.Constructor => new Constructor(this);

        ISynchronisationService IExecutionService.SynchronisationService => _synchronisationService;

        void IExecutionService.Execute(
            IExecutable executable
            )
        {
            if(executable is Synchronisation)
                return;

            _queue.Enqueue(executable);
        }

        public void Replay(
            Definition.Process                                           definition,
            IReadOnlyList<(bool Input, Channel Channel, object Message)> trace
            )
        {
            var service = (IExecutionService)this;
            var process = definition.Select(service.Constructor)(
                null,
                null);

            service.Execute(process);
            foreach(var item in trace)
            {
                while(_queue.Count > 0)
                {
                    _queue.Peek().Execute(this);
                    _queue.Dequeue();
                }

                var synchronisation = _synchronisationService.Resolve(item.Channel);
                if(item.Input)
                    synchronisation.Inputs.Single(next => next.UltimateParent == process).Executelnput(
                        this,
                        item.Message);

                else
                    synchronisation.Outputs.Single(next => next.UltimateParent == process).ExecuteOutput(this);
            }
        }
    }
}
