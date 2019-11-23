using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class OrganisationMember: JoinedSubclassMapping<Parties.OrganisationMember>
    {
        public OrganisationMember()
        {
        }
    }
}
