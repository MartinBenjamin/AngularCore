namespace Ontology
{
    public class ObjectPropertyRange:
        ObjectPropertyAxiom,
        IObjectPropertyRange
    {
        private IClassExpression _range;

        public ObjectPropertyRange(
            IObjectPropertyExpression objectPropertyExpression,
            IClassExpression          range
            ) : base(objectPropertyExpression)
        {
            _range = range;
        }

        IClassExpression IObjectPropertyRange.Range => _range;
    }
}
