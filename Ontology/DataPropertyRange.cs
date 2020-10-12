namespace Ontology
{
    public class DataPropertyRange:
        DataPropertyAxiom,
        IDataPropertyRange
    {
        private readonly IDataRange _range;

        public DataPropertyRange(
            IDataPropertyExpression dataPropertyExpression,
            IDataRange              range
            ) : base(dataPropertyExpression)
        {
            _range = range;
        }

        IDataRange IDataPropertyRange.Range => _range;
    }
}
