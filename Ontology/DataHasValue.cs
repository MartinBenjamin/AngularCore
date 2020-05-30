using System;
using System.Linq;

namespace Ontology
{
    public class DataHasValue:
        DataPropertyRestriction,
        IDataHasValue
    {
        private object                  _value;

        public DataHasValue(
            IDataPropertyExpression dataPropertyExpression,
            object                  value
            ) : base(dataPropertyExpression)
        {
            _value = value;
        }

        object IDataHasValue.Value => _value;

        public override bool HasMember(
            object individual
            ) => _dataPropertyExpression.Values(individual).Contains(_value);
    }
}
