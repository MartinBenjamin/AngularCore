using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class Identifier: ClassMapping<Agents.Identifier>
    {
        private static string _uniqueKeyName = "IdentificationScheme_Identifier";

        public Identifier()
        {
            ComposedId(
                composedIdMapper =>
                {
                    composedIdMapper.ManyToOne(
                        identifier => identifier.Scheme,
                        manyToOneMapper => manyToOneMapper.UniqueKey(_uniqueKeyName));
                    composedIdMapper.Property(identifier => identifier.Value);
                });

            ManyToOne(
                identifier => identifier.Identifies,
                manyToOneMapper => manyToOneMapper.UniqueKey(_uniqueKeyName));
        }
    }
}
