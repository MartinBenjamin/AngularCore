using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class Identifier: ClassMapping<Identifiers.Identifier>
    {
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

    public class Identifier<TIdentified>: ClassMapping<Identifiers.Identifier<TIdentified>> where TIdentified : class
    {
        public Identifier(): this(null)
        {
        }

        public Identifier(
            string typeName
            )
        {
            Table((typeName ?? typeof(TIdentified).Name) + "Identifier");

            ComposedId(
                composedIdMapper =>
                {
                    composedIdMapper.ManyToOne(identifier => identifier.Scheme);
                    composedIdMapper.Property(identifier => identifier.Tag);
                });

            ManyToOne(
                identifier => identifier.Identified,
                manyToOneMapper => manyToOneMapper.Unique(true));
        }
    }
}
