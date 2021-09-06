using Identifiers;

namespace Agents
{
    public class AutonomousAgentIdentifier: Identifier
    {
        public virtual AutonomousAgent AutonomousAgent { get; protected set; }

        protected AutonomousAgentIdentifier() : base()
        {
        }

        public AutonomousAgentIdentifier(
            IdentificationScheme scheme,
            string                tag,
            AutonomousAgent       autonomousAgent
            ) : base(
                scheme,
                tag)
        {
            AutonomousAgent = autonomousAgent;
        }
    }
}
