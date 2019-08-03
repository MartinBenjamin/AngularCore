using System;

namespace CommonDomainObjects
{
    public abstract class AutonomousAgent: Named<Guid>
    {
        protected AutonomousAgent() : base()
        {
        }

        protected AutonomousAgent(
            Guid   id,
            string name
            ) : base(
                id,
                name)
        {
        }
    }
}
