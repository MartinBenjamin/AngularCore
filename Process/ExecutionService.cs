using System.Collections.Generic;

namespace Process
{
    public class ExecutionService: IExecutionService
    {
        private Queue<IExecutable> _queue = new Queue<IExecutable>();
        private int                _entered;

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
    }
}
