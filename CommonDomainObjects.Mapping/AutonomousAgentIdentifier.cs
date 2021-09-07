using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class AutonomousAgentIdentifier: JoinedSubclassMapping<Agents.AutonomousAgentIdentifier>
    {
        public AutonomousAgentIdentifier()
        {
            Key(
                keyMapper =>
                {
                    keyMapper.Columns(
                        columnMapper => columnMapper.Name("SchemeId"),
                        columnMapper => columnMapper.Name("Tag"     ));
                });

            ManyToOne(
                identifier => identifier.AutonomousAgent,
                manyToOneMapper =>
                {
                    manyToOneMapper.Column("IdentifiedId");
                    manyToOneMapper.Unique(true);
                });
        }
    }
}
