using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class Organisation: JoinedSubclassMapping<Organisations.Organisation>
    {
        public Organisation()
        {
            Key(
                keyMapper =>
                {
                    keyMapper.Column(columnMapper => columnMapper.Name("Id"));

                    keyMapper.ForeignKey("FK_" + nameof(Organisation) + "_" + nameof(AutonomousAgent));
                });
        }
    }
}
