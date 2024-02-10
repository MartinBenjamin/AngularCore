using System;
using System.Collections.Generic;

namespace Process
{
    public abstract class Alternative: Process
    {
        protected Alternative()
            : base()
        {
        }

        protected Alternative(
            Guid                        id,
            Definition.Alternative      definition,
            Process                     parent,
            IDictionary<string, object> variables
            )
            : base(
                id,
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
