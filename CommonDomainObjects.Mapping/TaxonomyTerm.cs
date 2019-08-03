using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class TaxonomyTerm<TTerm>: ClassMapping<CommonDomainObjects.TaxonomyTerm<TTerm>>
    {
        public TaxonomyTerm(
            string prefix
            )
        {
            Table(prefix + "TaxonomyTerm");
            Bag(
                taxonomyTerm => taxonomyTerm.Narrower,
                collectionMapping => collectionMapping.Key(
                    keyMapping => keyMapping.Column("BroaderId")));
        }
    }
}
