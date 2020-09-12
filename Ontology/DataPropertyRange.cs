namespace Ontology
{
    public class DataPropertyRange:
        DataPropertyAxiom,
        IDataPropertyRange
    {
        private IDataRange _range;

        public DataPropertyRange(
            IDataPropertyExpression dataPropertyExpression,
            IDataRange              range
            ) : base(dataPropertyExpression)
        {
            _range = range;
            dataPropertyExpression.Ranges.Add(this);
        }

        IDataRange IDataPropertyRange.Range => _range;
    }
}
