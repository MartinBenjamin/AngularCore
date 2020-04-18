using CommonDomainObjects;
using System;
using System.Collections.Generic;

namespace Deals
{
    public abstract class Agreement: DomainObject<Guid>
    {
        public virtual Deal              Deal    { get; protected set; }
        public virtual string            Title   { get; protected set; }
        public virtual IList<DealParty>  Parties { get; protected set; }
        public virtual IList<Commitment> Confers { get; protected set; }

        protected Agreement() : base()
        {
        }

        protected Agreement(
            Guid   id,
            Deal   deal,
            string title
            ) : base(id)
        {
            Deal    = deal;
            Title   = title;
            Parties = new List<DealParty >();
            Confers = new List<Commitment>();
        }
    }
}
