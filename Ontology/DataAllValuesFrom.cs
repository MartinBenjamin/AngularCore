using System.Linq;

namespace Ontology
{
    public class DataAllValuesFrom:
        DataPropertyRestriction,
        IDataAllValuesFrom
    {
        private IDataRange _dataRange;

        public DataAllValuesFrom(
            IDataPropertyExpression dataPropertyExpression,
            IDataRange              dataRange
            ) : base(dataPropertyExpression)
        {
            _dataRange              = dataRange;
        }

        IDataRange IDataAllValuesFrom.DataRange => _dataRange;

        public override bool HasMember(
            object individual
            ) => _dataPropertyExpression.Values(individual).All(_dataRange.HasMember);
    }
}
