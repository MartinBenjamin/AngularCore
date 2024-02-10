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

        public abstract IList<global::Process.Process> NewChildren(
            IIdService<Guid>        idService,
            global::Process.Process parent);
    }
}
