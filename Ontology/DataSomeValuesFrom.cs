namespace Ontology
{
    public class DataSomeValuesFrom:
        DataPropertyRestriction,
        IDataSomeValuesFrom
    {
        private IDataRange _dataRange;

        public DataSomeValuesFrom(
            IDataPropertyExpression dataPropertyExpression,
            IDataRange              dataRange
            ) : base(dataPropertyExpression)
        {
            _dataRange = dataRange;
        }

        IDataRange IDataSomeValuesFrom.DataRange => _dataRange;

        public override bool Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            ) => evaluator.Evaluate(
                this,
                individual);
    }
}
