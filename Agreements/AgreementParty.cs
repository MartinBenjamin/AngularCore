using CommonDomainObjects;
using Organisations;
using Parties;
using People;
using Roles;
using System;

namespace Agreements
{
    public class AgreementParty: PartyInRole
    {
        public virtual Agreement Agreement { get; protected set; }

        protected AgreementParty() : base()
        {
        }

        public AgreementParty(
            Guid             id,
            Agreement        agreement,
            Person           person,
            Role             role,
            Range2<DateTime> period
            ) : base(
                id,
                person,
                role,
                period)
        {
            Agreement = agreement;
            Agreement.Parties.Add(this);
        }

        public AgreementParty(
            Guid             id,
            Agreement        agreement,
            Organisation     organisation,
            Role             role,
            Range2<DateTime> period
            ) : base(
                id,
                organisation,
                role,
                period)
        {
            Agreement = agreement;
            Agreement.Parties.Add(this);
        }
        
        public AgreementParty(
            Agreement        agreement,
            Person           person,
            Role             role,
            Range2<DateTime> period
            ) : this(
                Guid.NewGuid(),
                agreement,
                person,
                role,
                period)
        {
        }

        public AgreementParty(
            Agreement        agreement,
            Organisation     organisation,
            Role             role,
            Range2<DateTime> period
            ) : this(
                Guid.NewGuid(),
                agreement,
                organisation,
                role,
                period)
        {
        }
    }
}
