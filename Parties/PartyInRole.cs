using CommonDomainObjects;
using Organisations;
using People;
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
            Person           person,
            Role             role,
            Range2<DateTime> period
            ) : base(
                id,
                person,
                role)
        {
            Person = person;
            Period = period;
        }

        public PartyInRole(
            Guid             id,
            Organisation     organisation,
            Role             role,
            Range2<DateTime> period
            ) : base(
                id,
                organisation,
                role)
        {
            Organisation = organisation;
            Period       = period;
        }


        public PartyInRole(
            Person           person,
            Role             role,
            Range2<DateTime> period
            ) : this(
                Guid.NewGuid(),
                person,
                role,
                period)
        {
        }

        public PartyInRole(
            Organisation     organisation,
            Role             role,
            Range2<DateTime> period
            ) : this(
                Guid.NewGuid(),
                organisation,
                role,
                period)
        {
        }
    }
}
