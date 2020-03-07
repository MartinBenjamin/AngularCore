namespace Agents
{
    public class Identifier
    {
        public virtual IdentificationScheme Scheme     { get; protected set; }
        public virtual string               Value      { get; protected set; }
        public virtual AutonomousAgent      Identifies { get; protected set; }

        protected Identifier()
        {
        }

        public Identifier(
            IdentificationScheme scheme,
            string               value,
            AutonomousAgent      identifies
            )
        {
            Scheme     = scheme;
            Value      = value;
            Identifies = identifies;
        }

        public override bool Equals(
            object obj
            )
        {
            var identifier = obj as Identifier;
            return
                identifier != null &&
                Scheme     == identifier.Scheme &&
                Value      == identifier.Value;
        }

        public override int GetHashCode()
            => Value.GetHashCode();

        public static bool operator ==(
            Identifier lhs,
            Identifier rhs
            ) => Equals(
                lhs,
                rhs);

        public static bool operator !=(
            Identifier lhs,
            Identifier rhs
            ) => !(lhs == rhs);
    }
}
