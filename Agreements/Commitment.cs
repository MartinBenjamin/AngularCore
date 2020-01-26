using CommonDomainObjects;
using System;
using System.Collections.Generic;

namespace Agreements
{
    public abstract class Commitment: DomainObject<Guid>
    {
        public virtual Agreement             Agreement { get; protected set; }
        public virtual IList<AgreementParty> Obligors  { get; protected set; }
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
        }
    }
}
