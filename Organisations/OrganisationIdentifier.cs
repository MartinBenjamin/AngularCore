using Agents;

namespace Organisations
{
    public class OrganisationIdentifier: Identifier
    {
        new public virtual OrganisationIdentificationScheme Scheme     { get; protected set; }
        new public virtual Organisation                     Identifies { get; protected set; }

        protected OrganisationIdentifier()
        {
        }

        public OrganisationIdentifier(
            OrganisationIdentificationScheme scheme,
            string                           value,
            Organisation                     identifies
            ): base(
                scheme,
                value,
                identifies)
        {
            Scheme     = scheme;
            Value      = value;
            Identifies = identifies;
        }
    }
}
