using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class Person: JoinedSubclassMapping<People.Person>
    {
        public Person()
        {
            Key(
                keyMapper =>
                {
                    keyMapper.Column(columnMapper => columnMapper.Name("Id"));

                    keyMapper.ForeignKey("FK_" + nameof(Person) + "_" + nameof(AutonomousAgent));
                });
        }
    }
}
