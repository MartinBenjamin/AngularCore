namespace Ontology
{
    public abstract class Axiom:
        Annotated,
        IAxiom
    {
        protected IOntology _ontology;

        protected Axiom(
            IOntology ontology
            )
        {
            _ontology = ontology;
            _ontology.Axioms.Add(this);
        }

        IOntology IAxiom.Ontology => _ontology;
    }
}
