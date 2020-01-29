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
            var rhs = obj as Identifier;
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
            Identifier lhs,
            Identifier rhs
            )
        {
            return Equals(
                lhs,
                rhs);
        }

        public static bool operator !=(
            Identifier lhs,
            Identifier rhs
            )
        {
            return !(lhs == rhs);
        }
    }
}
