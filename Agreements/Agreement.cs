using CommonDomainObjects;
using System;
using System.Collections.Generic;

namespace Agreements
{
    public abstract class Agreement: DomainObject<Guid>
    {
        public IList<AgreementParty> Parties { get; protected set; }

        protected Agreement() : base()
        {
        }
    }
}
