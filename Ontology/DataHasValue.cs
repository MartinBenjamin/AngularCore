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

        public override bool Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            ) => evaluator.Evaluate(
                this,
                individual);
    }
}
