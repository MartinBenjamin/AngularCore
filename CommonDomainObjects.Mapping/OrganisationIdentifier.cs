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
                        columnMapper => columnMapper.Name("SchemeId"),
                        columnMapper => columnMapper.Name("Tag"     ));
                });

            ManyToOne(
                identifier => identifier.Organisation,
                manyToOneMapper =>
                {
                    manyToOneMapper.Column("IdentifiedId");
                    manyToOneMapper.Unique(true);
                });
        }
    }
}
