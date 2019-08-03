using System;

namespace CommonDomainObjects
{
    public abstract class AutonomousAgentInRole: DomainObject<Guid>
    {
        public virtual AutonomousAgent AutonomousAgent { get; protected set; }
        public virtual Role            Role            { get; protected set; }

        protected AutonomousAgentInRole() : base()
        {
        }

        protected AutonomousAgentInRole(
            Guid            id,
            AutonomousAgent autonomousAgent,
            Role            role
            ) : base(id)
        {
            AutonomousAgent = autonomousAgent;
            Role            = role;
        }
    }
}
