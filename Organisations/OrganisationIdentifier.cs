using Agents;
using Identifiers;

namespace Organisations
{
    public class OrganisationIdentifier: AutonomousAgentIdentifier
    {
        public virtual Organisation Organisation { get; protected set; }

        protected OrganisationIdentifier() : base()
        {
        }

        public OrganisationIdentifier(
            IdentificationScheme scheme,
            string               tag,
            Organisation         organisation
            ) : base(
                scheme,
                tag,
                organisation)
        {
            Organisation = organisation;
        }
    }
}
