namespace Ontology
{
    public class ObjectPropertyRange:
        ObjectPropertyAxiom,
        IObjectPropertyRange
    {
        private readonly IClassExpression _range;

        public ObjectPropertyRange(
            IOntology                 ontology,
            IObjectPropertyExpression objectPropertyExpression,
            IClassExpression          range
            ) : base(
                ontology,
                objectPropertyExpression)
        {
            _range = range;
        }

        IClassExpression IObjectPropertyRange.Range => _range;
    }
}
