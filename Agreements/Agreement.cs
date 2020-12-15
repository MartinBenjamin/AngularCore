using CommonDomainObjects;
using Parties;
using System;
using System.Collections.Generic;

namespace Agreements
{
    public abstract class Agreement: DomainObject<Guid>
    {
        public virtual string             Title   { get; protected set; }
        public virtual IList<PartyInRole> Parties { get; protected set; }
        public virtual IList<Commitment>  Confers { get; protected set; }

        protected Agreement() : base()
        {
        }

        protected Agreement(
            Guid   id,
            string title
            ) : base(id)
        {
            Title   = title;
            Parties = new List<PartyInRole>();
            Confers = new List<Commitment >();
        }
    }
}
