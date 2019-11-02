using CommonDomainObjects;
using Organisations;
using People;
using Roles;
using System;

namespace Parties
{
    public class OrganisationMember: PartyInRole
    {
        public virtual Organisation MemberOf { get; protected set; }

        protected OrganisationMember(): base()
        {
        }

        public OrganisationMember(
            Guid             id,
            Organisation     organisation,
            Person           member,
            Role             role,
            Range2<DateTime> period
            ) : base(
                id,
                member,
                role,
                period)
        {
            MemberOf = organisation;
        }

        public OrganisationMember(
            Guid             id,
            Organisation     organisation,
            Organisation     member,
            Role             role,
            Range2<DateTime> period
            ) : base(
                id,
                member,
                role,
                period)
        {
            MemberOf = organisation;
        }

        public OrganisationMember(
            Organisation     organisation,
            Person           member,
            Role             role,
            Range2<DateTime> period
            ) : this(
                Guid.NewGuid(),
                organisation,
                member,
                role,
                period)
        {
        }

        public OrganisationMember(
            Organisation     organisation,
            Organisation     member,
            Role             role,
            Range2<DateTime> period
            ) : this(
                Guid.NewGuid(),
                organisation,
                member,
                role,
                period)
        {
        }
    }
}
