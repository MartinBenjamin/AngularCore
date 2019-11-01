using CommonDomainObjects;
using Organisations;
using People;
using Roles;
using System;

namespace Parties
{
    public class OrganisationMember: PartyInRole
    {
        public virtual Organisation Organisation { get; protected set; }

        protected OrganisationMember(): base()
        {
        }

        public OrganisationMember(
            Guid             id,
            Organisation     organisation,
            Person           party,
            Role             role,
            Range2<DateTime> period
            ) : base(
                id,
                party,
                role,
                period)
        {
            Organisation = organisation;
        }

        public OrganisationMember(
            Guid             id,
            Organisation     organisation,
            Organisation     party,
            Role             role,
            Range2<DateTime> period
            ) : base(
                id,
                party,
                role,
                period)
        {
            Organisation = organisation;
        }

        public OrganisationMember(
            Organisation     organisation,
            Person           party,
            Role             role,
            Range2<DateTime> period
            ) : this(
                Guid.NewGuid(),
                organisation,
                party,
                role,
                period)
        {
        }

        public OrganisationMember(
            Organisation     organisation,
            Organisation     party,
            Role             role,
            Range2<DateTime> period
            ) : this(
                Guid.NewGuid(),
                organisation,
                party,
                role,
                period)
        {
        }
    }
}
