using CommonDomainObjects;
using System;

namespace Agreements
{
    public abstract class Commitment: DomainObject<Guid>
    {
        protected Commitment() : base()
        {
        }

        protected Commitment(
            Guid id
            ) : base(id)
        {
        }
    }
}
