using CommonDomainObjects;
using Organisations;
using Roles;
using System;

namespace Deals
{
    public class Sponsor: DealParty
    {
        public decimal? Equity { get; protected set; }
        
        public Sponsor(
            Guid             id,
            Deal             deal,
            Organisation     organisation,
            Role             role,
            Range2<DateTime> period,
            decimal?         equity
            ) : base(
                id,
                deal,
                organisation,
                role,
                period)
        {
            Equity = equity;
        }
    }
}
