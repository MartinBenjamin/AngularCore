using System;

namespace Identifiers
{
    public class Identifier
    {
        public virtual IdentificationScheme Scheme { get; protected set; }
        public virtual string               Tag    { get; protected set; }

        protected Identifier()
        {
        }

        public Identifier(
            IdentificationScheme scheme,
            string               tag
            )
        {
            Scheme = scheme;
            Tag    = tag;
        }

        public override bool Equals(
            object obj
            ) => obj is Identifier identifier &&
                Scheme == identifier.Scheme &&
                Tag    == identifier.Tag;

        public override int GetHashCode()
            => HashCode.Combine(
                    Scheme.Id,
                    Tag);

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

    public class Identifier<TIdentified>: Identifier where TIdentified: class
    {
        public virtual TIdentified Identified { get; protected set; }

        protected Identifier(): base()
        {
        }

        public Identifier(
            IdentificationScheme scheme,
            string               tag,
            TIdentified          identified
            ): base(
                scheme,
                tag)
        {
            Identified = identified;
        }
    }
}
