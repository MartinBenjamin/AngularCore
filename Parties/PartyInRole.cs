using CommonDomainObjects;
using Organisations;
using People;
using Roles;
using System;

namespace Parties
{
    public class PartyInRole: AutonomousAgentInRole
    {
         // A Party is a Person or an Organisation but not both.
        public virtual Person           Person       { get; protected set; }
        public virtual Organisation     Organisation { get; protected set; }
        public virtual Range2<DateTime> Period       { get; protected set; }

        protected PartyInRole() : base()
        {
        }

        public PartyInRole(
            Guid             id,
            Person           party,
            Role             role,
            Range2<DateTime> period
            ) : base(
                id,
                party,
                role)
        {
            Person = party;
            Period = period;
        }

        public PartyInRole(
            Guid             id,
            Organisation     party,
            Role             role,
            Range2<DateTime> period
            ) : base(
                id,
                party,
                role)
        {
            Organisation = party;
            Period       = period;
        }
    }
}
