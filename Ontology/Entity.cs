namespace Ontology
{
    public abstract class Entity: IEntity
    {
        protected IOntology _ontology;
        protected string    _name;

        protected Entity(
            IOntology ontology,
            string    name
            )
        {
            _ontology = ontology;
            _name     = name;
        }

        IOntology IEntity.Ontology => _ontology;

        string IEntity.Name => _name;
    }
}
