using System;
using System.Collections.Generic;

namespace Process.Definition
{
    public abstract class Composite: Process
    {
        protected Composite()
            : base()
        {
        }

        protected Composite(
            Guid id
            )
            : base(id)
        {
        }

        public abstract IEnumerable<global::Process.Process> NewChildren(
            global::Process.Process parent);
    }
}
