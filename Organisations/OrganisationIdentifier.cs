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

        public override bool Equals(
            object obj
            )
        {
            var rhs = obj as OrganisationIdentifier;
            return
                rhs != null &&
                Scheme == rhs.Scheme &&
                Value  == rhs.Value;
        }

        public override int GetHashCode()
        {
            return Value.GetHashCode();
        }

        public static bool operator ==(
            OrganisationIdentifier lhs,
            OrganisationIdentifier rhs
            )
        {
            return Equals(
                lhs,
                rhs);
        }

        public static bool operator !=(
            OrganisationIdentifier lhs,
            OrganisationIdentifier rhs
            )
        {
            return !(lhs == rhs);
        }
    }
}
