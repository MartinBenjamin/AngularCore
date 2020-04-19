using CommonDomainObjects;
using System;
using System.Collections.Generic;

namespace Deals
{
    public abstract class Commitment: DomainObject<Guid>
    {
        public virtual Deal             Deal     { get; protected set; }
        // Parties that are bound legally or by agreement to repay a debt, make a payment, do something, or refrain from doing something.
        public virtual IList<DealParty> Obligors { get; protected set; }

        protected Commitment() : base()
        {
        }

        protected Commitment(
            Guid             id,
            Deal             deal,
            IList<DealParty> obligors
            ) : base(id)
        {
            Deal     = deal;
            Obligors = obligors;
            Deal.Commitments.Add(this);
        }
    }
}
