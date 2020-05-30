using System.Linq;

namespace Ontology
{
    public class DataAllValuesFrom:
        ClassExpression,
        IDataAllValuesFrom
    {
        private IDataPropertyExpression _dataPropertyExpression;
        private IDataRange              _dataRange;

        public DataAllValuesFrom(
            IDataPropertyExpression dataPropertyExpression,
            IDataRange              dataRange
            )
        {
            _dataPropertyExpression = dataPropertyExpression;
            _dataRange              = dataRange;
        }

        IDataPropertyExpression IDataAllValuesFrom.DataPropertyExpression => _dataPropertyExpression;

        IDataRange IDataAllValuesFrom.DataRange => _dataRange;

        public override bool HasMember(
            object individual
            ) => _dataPropertyExpression.Values(individual).All(_dataRange.HasMember);
    }
}
