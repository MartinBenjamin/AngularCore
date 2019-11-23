using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class PartyInRole: JoinedSubclassMapping<Parties.PartyInRole>
    {
        public PartyInRole()
        {
        }
    }
}
