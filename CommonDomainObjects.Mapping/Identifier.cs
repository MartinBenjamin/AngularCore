using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class Identifier: ClassMapping<Identifiers.Identifier>
    {
        public static readonly string UniqueKeyNames = "AutonomousAgent";

        public Identifier()
        {
            ComposedId(
                composedIdMapper =>
                {
                    composedIdMapper.ManyToOne(identifier => identifier.Scheme);
                    composedIdMapper.Property(identifier => identifier.Tag);
                });
        }
    }
}
