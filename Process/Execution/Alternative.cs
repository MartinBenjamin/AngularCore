using System.Collections.Generic;

namespace Process.Execution
{
    public abstract class Alternative: Process
    {
        protected Alternative(
            Definition.Alternative      definition,
            Process                     parent,
            IDictionary<string, object> variables
            )
            : base(
                definition,
                parent,
                variables)
        {
        }

        public abstract bool Choose(
            IExecutionService executionService,
            Alternative       alternative);
    }
}
