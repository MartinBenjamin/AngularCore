namespace Ontology
{
    public class ObjectPropertyRange:
        ObjectPropertyAxiom,
        IObjectPropertyRange
    {
        private readonly IClassExpression _range;

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
