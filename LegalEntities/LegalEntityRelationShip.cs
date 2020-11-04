using CommonDomainObjects;
using System;

namespace LegalEntities
{
    public class LegalEntityRelationship: DomainObject
    {
        public LegalEntity Source { get; protected set; }
        public LegalEntity Target { get; protected set; }

        public LegalEntityRelationship(
            LegalEntity source,
            LegalEntity target
            )
        {
            Source = source;
            Target = target;
        }

        public override bool Equals(
            object obj
            )
        {
            return obj is LegalEntityRelationship legalEntityRelationship
                && Source == legalEntityRelationship.Source
                && Target == legalEntityRelationship.Target;
        }

        public override int GetHashCode()
            => HashCode.Combine(
                Source.Id,
                Target.Id);

        public static bool operator ==(
            LegalEntityRelationship lhs,
            LegalEntityRelationship rhs
            )
        {
            return Equals(lhs, rhs);
        }

        public static bool operator !=(
            LegalEntityRelationship lhs,
            LegalEntityRelationship rhs
            )
        {
            return !(lhs == rhs);
        }
    }

    public class UltimateParentRelationShip: LegalEntityRelationship
    {
        public UltimateParentRelationShip(
            LegalEntity source,
            LegalEntity target
            ) : base(
                source,
                target)
        {
        }
    }
}
