using CommonDomainObjects;
using System;
using System.Collections.Generic;

namespace Agreements
{
    public abstract class Agreement: DomainObject<Guid>
    {
        public virtual string                Title   { get; protected set; }
        public virtual IList<AgreementParty> Parties { get; protected set; }
        public virtual IList<Commitment>     Confers { get; protected set; }

        protected Agreement() : base()
        {
        }

        protected Agreement(
            Guid   id,
            string title
            ) : base(id)
        {
            Title   = title;
            Parties = new List<AgreementParty>();
            Confers = new List<Commitment    >();
        }
    }
}
