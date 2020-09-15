using System;
using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public class DataHasValue:
        DataPropertyRestriction,
        IDataHasValue
    {
        private object _value;

        public DataHasValue(
            IDataPropertyExpression dataPropertyExpression,
            object                  value
            ) : base(dataPropertyExpression)
        {
            _value = value;
        }

        object IDataHasValue.Value => _value;

        public override bool HasMember(
            IOntology                                      context,
            IDictionary<object, HashSet<IClassExpression>> classifications,
            object                                         individual
            ) => _dataPropertyExpression.Values(
                context,    
                individual).Contains(_value);
    }
}
