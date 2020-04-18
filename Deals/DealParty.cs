using CommonDomainObjects;
using Organisations;
using Parties;
using People;
using Roles;
using System;

namespace Deals
{
    public class DealParty: PartyInRole
    {
        public virtual Deal Deal { get; protected set; }

        protected DealParty() : base()
        {
        }

        public DealParty(
            Guid             id,
            Deal             deal,
            Person           person,
            Role             role,
            Range2<DateTime> period
            ) : base(
                id,
                person,
                role,
                period)
        {
            Deal = deal;
            Deal.Parties.Add(this);
        }

        public DealParty(
            Guid             id,
            Deal             deal,
            Organisation     organisation,
            Role             role,
            Range2<DateTime> period
            ) : base(
                id,
                organisation,
                role,
                period)
        {
            Deal = deal;
            Deal.Parties.Add(this);
        }
        
        public DealParty(
            Deal             deal,
            Person           person,
            Role             role,
            Range2<DateTime> period
            ) : this(
                Guid.NewGuid(),
                deal,
                person,
                role,
                period)
        {
        }

        public DealParty(
            Deal             deal,
            Organisation     organisation,
            Role             role,
            Range2<DateTime> period
            ) : this(
                Guid.NewGuid(),
                deal,
                organisation,
                role,
                period)
        {
        }
    }
}
