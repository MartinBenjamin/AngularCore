namespace Ontology
{
    public abstract class Entity:
        Axiom,
        IEntity
    {
        protected readonly string _localName;

        protected Entity(
            IOntology ontology,
            string    localName
            ) : base(ontology)
        {
            _localName = localName;
        }

        string IEntity.Iri => _ontology.Iri + '.' + _localName;

        string IEntity.LocalName => _localName;

        public override string ToString() => _localName;
    }
}
