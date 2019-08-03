using System;

namespace CommonDomainObjects
{
    public class PartyInRole: AutonomousAgentInRole
    {
        public virtual Range2<DateTime> Period { get; protected set; }

        protected PartyInRole() : base()
        {
        }

        protected PartyInRole(
            Guid             id,
            AutonomousAgent  autonomousAgent,
            Role             role,
            Range2<DateTime> period
            ) : base(
                id,
                autonomousAgent,
                role)
        {
            Period = period;
        }
    }
}
