using Process.Definition;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Process
{
    public class ExecutionService: IExecutionService
    {
        private Queue<IExecutable> _queue = new Queue<IExecutable>();
        private int                _entered;

        private IDictionary<Channel, ISet<IO>                   > _awaitSync = new Dictionary<Channel, ISet<IO>>();
        private IDictionary<Channel, (ISet<Input>, ISet<Output>)> _awaitIO   = new Dictionary<Channel, (ISet<Input>, ISet<Output>)>();

        void IExecutionService.Save(
            IExecutable executable
            )
        {
        }

        void IExecutionService.Delete(
            IExecutable executabLe
            )
        {
        }

        void IExecutionService.Execute(
            IExecutable executable
            )
        {
            try
            {
                _entered += 1;
                _queue.Enqueue(executable);
                if(_entered == 1)
                    while(_queue.Count > 0)
                    {
                        _queue.Peek().Execute(this);
                        _queue.Dequeue();
                    }
            }
            finally
            {
                _entered -= 1;
            }
        }

        private void IO()
        {
            foreach(var ios in _awaitSync.Values)
                if(ios.Count >= 2)
                    foreach(var io in ios.ToArray())
                        io.ExecuteIO(this);

            foreach(var (inputs, outputs) in _awaitIO.Values)
                if(inputs.Count > 0 && outputs.Count > 0)
                {
                    var outputArray = outputs.ToArray();
                    var inputArray = inputs.ToArray();

                    for(var index = 0; index < Math.Min(outputArray.Length, inputArray.Length);++index)
                        inputArray[index].Executelnput(
                            this,
                            outputArray[index].ExecuteOutput(this));
                }
        }

        void IExecutionService.Register(IO io)
        {
            throw new NotImplementedException();
        }

        void IExecutionService.Register(
            Input input
            )
        {
            (ISet<Input> Inputs, ISet<Output> Outputs) inputsOutputs;
            var previousSyncCount = 0;
            if(_awaitIO.TryGetValue(
                input.Channel,
                out inputsOutputs))
            {
                previousSyncCount = Math.Min(inputsOutputs.Inputs.Count, inputsOutputs.Outputs.Count);
                inputsOutputs.Inputs.Add(input);
            }

            else
                _awaitIO[input.Channel] = (new HashSet<Input>() { input }, new HashSet<Output>());

            if(previousSyncCount == 0 && Math.Min(inputsOutputs.Inputs.Count, inputsOutputs.Outputs.Count) > 0)
            { };
        }

        void IExecutionService.Register(
            Output output
            )
        {
            //(ISet<Input> Inputs, ISet<Output> Outputs) inputsOutputs;
            //var previousSyncCount = 0;
            //var channel = ((Definition.IO)output.Definition).Channel.Evaluate(output);
            //if(_awaitIO.TryGetValue(
            //    channel,
            //    out inputsOutputs))
            //{
            //    previousSyncCount = Math.Min(inputsOutputs.Inputs.Count, inputsOutputs.Outputs.Count);
            //    inputsOutputs.Outputs.Add(output);
            //}

            //else
            //    _awaitIO[channel] = (new HashSet<Input>(), new HashSet<Output>() { output });

            //if(previousSyncCount == 0 && Math.Min(inputsOutputs.Inputs.Count, inputsOutputs.Outputs.Count) > 0)
            //{ };
        }

        void IExecutionService.Deregister(IO io)
        {
            throw new NotImplementedException();
        }

        void IExecutionService.Deregister(
            Input input
            )
        {
            //if(_awaitIO.TryGetValue(
            //    ((Definition.IO)input.Definition).Channel.Evaluate(input),
            //    out (ISet<Input> Inputs, ISet<Output>) inputsOutputs))
            //    inputsOutputs.Inputs.Remove(input);
        }

        void IExecutionService.Deregister(
            Output output
            )
        {
            //if(_awaitIO.TryGetValue(
            //    ((Definition.IO)output.Definition).Channel.Evaluate(output),
            //    out (ISet<Input>, ISet<Output> Outputs) inputsOutputs))
            //    inputsOutputs.Outputs.Remove(output);
        }
    }
}
