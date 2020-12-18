using CommonDomainObjects;
using Parties;
using System;
using System.Collections.Generic;

namespace Agreements
{
    public abstract class Commitment: DomainObject<Guid>
    {
        // Parties that are bound legally or by agreement to repay a debt, make a payment, do something, or refrain from doing something.
        public virtual IList<PartyInRole> Obligors { get; protected set; }

        protected Commitment() : base()
        {
        }

        protected Commitment(
            Guid id
            ) : base(id)
        {
            Obligors = new List<PartyInRole>();
        }
    }
}
