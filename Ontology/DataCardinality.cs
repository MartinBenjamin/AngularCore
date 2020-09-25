using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public abstract class DataCardinality:
        DataPropertyRestriction,
        IDataCardinality
    {
        protected int        _cardinality;
        protected IDataRange _dataRange;

        protected DataCardinality(
            IDataPropertyExpression dataPropertyExpression,
            int                     cardinality,
            IDataRange              dataRange
            ) : base(dataPropertyExpression)
        {
            _cardinality = cardinality;
            _dataRange   = dataRange;
        }

        int IDataCardinality.Cardinality => _cardinality;

        IDataRange IDataCardinality.DataRange => _dataRange;

        protected int Count(
            IOntology context,
            object    individual
            )
        {
            var values = _dataPropertyExpression.Values(
                context,
                individual);
            return _dataRange != null ? values.Count(_dataRange.HasMember) : values.Count();
        }
    }

    public class DataMinCardinality:
        DataCardinality,
        IDataMinCardinality
    {
        public DataMinCardinality(
            IDataPropertyExpression dataPropertyExpression,
            int                     cardinality,
            IDataRange              dataRange = null
            ) : base(
                dataPropertyExpression,
                cardinality,
                dataRange)
        {
        }

        public override bool HasMember(
            IOntology                                      context,
            IDictionary<object, HashSet<IClassExpression>> classifications,
            object                                         individual
            ) => Count(
                context,
                individual) >= _cardinality;

        public override bool Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            ) => evaluator.Evaluate(
                this,
                individual);
    }

    public class DataMaxCardinality:
        DataCardinality,
        IDataMaxCardinality
    {
        public DataMaxCardinality(
            IDataPropertyExpression dataPropertyExpression,
            int                     cardinality,
            IDataRange              dataRange = null
            ) : base(
                dataPropertyExpression,
                cardinality,
                dataRange)
        {
        }

        public override bool HasMember(
            IOntology                                      context,
            IDictionary<object, HashSet<IClassExpression>> classifications,
            object                                         individual
            ) => Count(
                context,
                individual) <= _cardinality;

        public override bool Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            ) => evaluator.Evaluate(
                this,
                individual);

    }

    public class DataExactCardinality:
        DataCardinality,
        IDataExactCardinality
    {
        public DataExactCardinality(
            IDataPropertyExpression dataPropertyExpression,
            int                     cardinality,
            IDataRange              dataRange = null
            ) : base(
                dataPropertyExpression,
                cardinality,
                dataRange)
        {
        }

        public override bool HasMember(
            IOntology                                      context,
            IDictionary<object, HashSet<IClassExpression>> classifications,
            object                                         individual
            ) => Count(
                context,
                individual) == _cardinality;

        public override bool Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            ) => evaluator.Evaluate(
                this,
                individual);
    }
}
