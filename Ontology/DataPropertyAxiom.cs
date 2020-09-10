namespace Ontology
{
    public abstract class DataPropertyAxiom:
        Axiom,
        IDataPropertyAxiom
    {
        private IDataPropertyExpression _dataPropertyExpression;

        protected DataPropertyAxiom(
            IDataPropertyExpression dataPropertyExpression
            ) : base(dataPropertyExpression.Ontology)
        {
            _dataPropertyExpression = dataPropertyExpression;
        }

        IDataPropertyExpression IDataPropertyAxiom.DataPropertyExpression => _dataPropertyExpression;
    }
}
