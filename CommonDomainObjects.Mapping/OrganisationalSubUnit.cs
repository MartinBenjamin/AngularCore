using NHibernate.Mapping.ByCode.Conformist;


namespace CommonDomainObjects.Mapping
{
    public class OrganisationalSubUnit: JoinedSubclassMapping<Organisations.OrganisationalSubUnit>
    {
        public OrganisationalSubUnit()
        {
            Key(
                keyMapper =>
                {
                    keyMapper.Column(columnMapper => columnMapper.Name("Id"));

                    keyMapper.ForeignKey("FK_" + nameof(OrganisationalSubUnit) + "_Parent" + nameof(Organisation));
                });
        }
    }
}
