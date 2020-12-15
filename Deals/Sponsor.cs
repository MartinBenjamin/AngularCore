using CommonDomainObjects;
using Organisations;
using Parties;
using Roles;
using System;

namespace Deals
{
    public class Sponsor: PartyInRole
    {
        public decimal? Equity { get; protected set; }
        
        public Sponsor(
            Guid             id,
            Organisation     organisation,
            Role             role,
            Range2<DateTime> period,
            decimal?         equity
            ) : base(
                id,
                organisation,
                role,
                period)
        {
            Equity = equity;
        }
              
        public Sponsor(
            Organisation     organisation,
            Role             role,
            Range2<DateTime> period,
            decimal?         equity
            ) : this(
                Guid.NewGuid(),
                organisation,
                role,
                period,
                equity)
        {
        }
    }
}
