using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class TaxonomyTerm<TTerm>: ClassMapping<CommonDomainObjects.TaxonomyTerm<TTerm>>
    {
        public TaxonomyTerm() : this(typeof(TTerm).Name)
        {
        }

        public TaxonomyTerm(
            string typeName = null
            )
        {
            Table((typeName ?? typeof(TTerm).Name) + "TaxonomyTerm");
            Bag(
                taxonomyTerm => taxonomyTerm.Narrower,
                bagPropertiesMapper => bagPropertiesMapper.Key(
                    keyMapper => keyMapper.Column("BroaderId")));
        }
    }
}
