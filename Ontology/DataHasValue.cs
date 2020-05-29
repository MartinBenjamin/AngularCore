using System;
using System.Linq;

namespace Ontology
{
    public class DataHasValue:
        ClassExpression,
        IDataHasValue
    {
        private IDataPropertyExpression _dataPropertyExpression;
        private object                  _value;

        public DataHasValue(
            IDataPropertyExpression dataPropertyExpression,
            object                  value
            )
        {
            _dataPropertyExpression = dataPropertyExpression;
            _value                  = value;
        }

        IDataPropertyExpression IDataHasValue.DataPropertyExpression => _dataPropertyExpression;

        object IDataHasValue.Value => _value;

        public override bool HasMember(
            object individual
            ) => _dataPropertyExpression.Values(individual).Contains(_value);
    }
}
