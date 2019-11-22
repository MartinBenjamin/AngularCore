using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class OrganisationalSubUnit: JoinedSubclassMapping<Organisations.OrganisationalSubUnit>
    {
        public OrganisationalSubUnit()
        {
        }
    }
}
