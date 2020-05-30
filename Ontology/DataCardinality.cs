using System.Linq;

namespace Ontology
{
    public abstract class DataCardinality:
        DataPropertyRestriction,
        IDataCardinality
    {
        protected int                     _cardinality;
        protected IDataRange              _dataRange;

        protected DataCardinality(
            IDataPropertyExpression dataPropertyExpression,
            int                     cardinality,
            IDataRange              dataRange
            ) : base(dataPropertyExpression)
        {
            _cardinality            = cardinality;
            _dataRange              = dataRange;
        }

        int IDataCardinality.Cardinality => _cardinality;

        IDataRange IDataCardinality.DataRange => _dataRange;

        protected int Count(
            object individual
            )
        {
            var values = _dataPropertyExpression.Values(individual);
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
            object individual
            ) => Count(individual) >= _cardinality;
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
            object individual
            ) => Count(individual) <= _cardinality;
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
            object individual
            ) => Count(individual) == _cardinality;
    }
}
