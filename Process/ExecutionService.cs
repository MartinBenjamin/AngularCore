using System.Collections.Generic;

namespace Process
{
    public class ExecutionService: IExecutionService
    {
        private ISynchronisationService _synchronisationService = new SynchronisationService();
        private Queue<IExecutable>      _queue = new Queue<IExecutable>();
        private int                     _entered;

        ISynchronisationService IExecutionService.SynchronisationService => _synchronisationService;

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
    }
}
