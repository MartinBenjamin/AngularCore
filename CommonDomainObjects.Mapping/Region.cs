using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class Region: SubclassMapping<UnsdM49.Region>
    {
        public Region()
        {
            DiscriminatorValue(nameof(UnsdM49.Region));
        }
    }
}

