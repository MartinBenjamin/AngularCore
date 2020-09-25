using System.Collections.Generic;
using System.Linq;

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

        public override bool HasMember(
            IOntology                                      context,
            IDictionary<object, HashSet<IClassExpression>> classifications,
            object                                         individual
            ) => _dataPropertyExpression.Values(
                context,
                individual).Any(_dataRange.HasMember);

        public override bool Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            ) => evaluator.Evaluate(
                this,
                individual);
    }
}
