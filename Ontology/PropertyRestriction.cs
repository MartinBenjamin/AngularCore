namespace Ontology
{
    public abstract class PropertyRestriction:
        ClassExpression,
        IPropertyRestriction
    {
        private IPropertyExpression _propertyExpression;

        protected PropertyRestriction(
            IPropertyExpression propertyExpression
            )
        {
            _propertyExpression = propertyExpression;
        }

        IPropertyExpression IPropertyRestriction.PropertyExpression => _propertyExpression;
    }
}
