using System;
using System.Collections.Generic;

namespace CommonDomainObjects.Process.Definition
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

        public abstract IEnumerable<CommonDomainObjects.Process.Process> NewChildren(
            CommonDomainObjects.Process.Process parent);
    }
}
