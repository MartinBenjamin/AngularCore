using System.Collections.Generic;

namespace Process
{
    public class ExecutionService: IExecutionService
    {
        private IList<IExecutable> _queue = new List<IExecutable>();
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
                _queue.Add(executable);
                if(_entered == 1)
                    while(_queue.Count > 0)
                    {
                        _queue[0].Execute(this);
                        _queue.RemoveAt(0);
                    }
            }
            finally
            {
                _entered -= 1;
            }
        }
    }
}
