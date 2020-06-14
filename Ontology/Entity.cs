namespace Ontology
{
    public abstract class Entity:
        Axiom,
        IEntity
    {
        protected string _name;

        protected Entity(
            IOntology ontology,
            string    name
            ) : base(ontology)
        {
            _name = name;
        }

        string IEntity.Name => _name;
    }
}
