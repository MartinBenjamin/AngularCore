using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class Taxonomy<TTerm>: ClassMapping<CommonDomainObjects.Taxonomy<TTerm>>
    {
        public Taxonomy(
            string prefix
            )
        {
            Table(prefix + "Taxonomy");
        }
    }
}
