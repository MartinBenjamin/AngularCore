namespace Ontology
{
    public class BuiltIn:
        Axiom,
        IEntity
    {
        protected string _iri;
        protected string _localName;

        protected BuiltIn(
            string prefixIri,
            string localName
            ) : base(null)
        {
            _iri       = prefixIri + localName;
            _localName = localName;
        }

        string IEntity.Iri => _iri;

        string IEntity.LocalName => _localName;

        public override string ToString() => _localName;
    }
}
