namespace Ontology
{
    public abstract class ObjectPropertyAxiom:
        Axiom,
        IObjectPropertyAxiom
    {
        private readonly IObjectPropertyExpression _objectPropertyExpression;

        protected ObjectPropertyAxiom(
            IObjectPropertyExpression objectPropertyExpression
            ) : base(objectPropertyExpression.Ontology)
        {
            _objectPropertyExpression = objectPropertyExpression;
        }

        IObjectPropertyExpression IObjectPropertyAxiom.ObjectPropertyExpression => _objectPropertyExpression;
    }
}
