using System.Linq;

namespace Ontology
{
    public class DataSomeValuesFrom:
        ClassExpression,
        IDataSomeValuesFrom
    {
        private IDataPropertyExpression _dataPropertyExpression;
        private IDataRange              _dataRange;

        public DataSomeValuesFrom(
            IDataPropertyExpression dataPropertyExpression,
            IDataRange              dataRange
            )
        {
            _dataPropertyExpression = dataPropertyExpression;
            _dataRange              = dataRange;
        }

        IDataPropertyExpression IDataSomeValuesFrom.DataPropertyExpression => _dataPropertyExpression;

        IDataRange IDataSomeValuesFrom.DataRange => _dataRange;

        public override bool HasMember(
            object individual
            ) => _dataPropertyExpression.Values(individual).Any(_dataRange.HasMember);
    }
}
