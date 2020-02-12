using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class Taxonomy<TTerm>: ClassMapping<CommonDomainObjects.Taxonomy<TTerm>>
    {
        public Taxonomy() : this(typeof(TTerm).Name)
        {
        }

        public Taxonomy(
            string typeName
            )
        {
            Table((typeName ?? typeof(TTerm).Name) + "Taxonomy");
        }
    }
}
