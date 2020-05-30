namespace Ontology
{
    public abstract class DataPropertyRestriction:
        ClassExpression,
        IDataPropertyRestriction
    {
        protected IDataPropertyExpression _dataPropertyExpression;

        protected DataPropertyRestriction(
            IDataPropertyExpression dataPropertyExpression
            )
        {
            _dataPropertyExpression = dataPropertyExpression;
        }

        IDataPropertyExpression IDataPropertyRestriction.DataPropertyExpression => _dataPropertyExpression;
    }
}
