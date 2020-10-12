namespace Ontology
{
    public class SubClassOf:
        Axiom,
        ISubClassOf
    {
        private readonly IClassExpression _subClassExpression;
        private readonly IClassExpression _superClassExpression;

        public SubClassOf(
            IOntology        ontology,
            IClassExpression subClassExpression,
            IClassExpression superClassExpression
            ): base(ontology)
        {
            _subClassExpression   = subClassExpression;
            _superClassExpression = superClassExpression;
        }

        IClassExpression ISubClassOf.SubClassExpression => _subClassExpression;

        IClassExpression ISubClassOf.SuperClassExpression => _superClassExpression;
    }
}
