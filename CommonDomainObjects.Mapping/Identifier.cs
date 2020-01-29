using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class Identifier: ClassMapping<Agents.Identifier>
    {
        public Identifier()
        {
            ComposedId(
                composedIdmapper =>
                {
                    ManyToOne(Identifier => Identifier.Scheme    );
                    ManyToOne(identifier => identifier.Identifies);
                });
        }
    }
}
