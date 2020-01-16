using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class Branch: JoinedSubclassMapping<Organisations.Branch>
    {
        public Branch()
        {
        }
    }
}
