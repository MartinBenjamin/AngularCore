using CommonDomainObjects;
using System;
using System.Collections.Generic;

namespace Agreements
{
    public abstract class Commitment: DomainObject<Guid>
    {
        public virtual Agreement             Agreement { get; protected set; }
        // Parties that are bound legally or by agreement to repay a debt, make a payment, do something, or refrain from doing something.
        public virtual IList<AgreementParty> Obligors  { get; protected set; }
        // Parties to whom some commitment or obligation is owed, either legally or per the terms of an agreement
        public virtual IList<AgreementParty> Obligees  { get; protected set; }

        protected Commitment() : base()
        {
        }

        protected Commitment(
            Guid                  id,
            Agreement             agreement,
            IList<AgreementParty> obligors,
            IList<AgreementParty> obligees
            ) : base(id)
        {
            Agreement = agreement;
            Obligors  = obligors;
            Obligees  = obligees;
            Agreement.Confers.Add(this);
        }
    }
}
