using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class Person: JoinedSubclassMapping<People.Person>
    {
        public Person()
        {
        }
    }
}
