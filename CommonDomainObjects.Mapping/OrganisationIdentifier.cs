using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class OrganisationIdentifier: JoinedSubclassMapping<Organisations.OrganisationIdentifier>
    {
        public OrganisationIdentifier()
        {
            Key(
                keyMapper =>
                {
                    keyMapper.Columns(
                        columnMapper => columnMapper.Name("Scheme"),
                        columnMapper => columnMapper.Name("Tag"   ));
                });

            ManyToOne(
                identifier => identifier.Organisation,
                manyToOneMapper => manyToOneMapper.Unique(true));
        }
    }
}
