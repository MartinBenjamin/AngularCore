namespace Ontology
{
    public abstract class ObjectPropertyRestriction:
        ClassExpression,
        IObjectPropertyRestriction
    {
        protected IObjectPropertyExpression _objectPropertyExpression;
        protected ObjectPropertyRestriction(
            IObjectPropertyExpression objectPropertyExpression
            )
        {
            _objectPropertyExpression = objectPropertyExpression;
        }

        IObjectPropertyExpression IObjectPropertyRestriction.ObjectPropertyExpression => _objectPropertyExpression;
    }
}
