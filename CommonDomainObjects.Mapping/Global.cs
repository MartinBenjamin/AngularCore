using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class Global: SubclassMapping<UnsdM49.Global>
    {
        public Global()
        {
            DiscriminatorValue("Global");
        }
    }
}
