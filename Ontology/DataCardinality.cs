﻿namespace Ontology
{
    public abstract class DataCardinality:
        DataPropertyRestriction,
        IDataCardinality
    {
        protected readonly int        _cardinality;
        protected readonly IDataRange _dataRange;

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

        public override void Accept(
            IClassExpressionVisitor visitor
            ) => visitor.Visit(this);

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

        public override void Accept(
            IClassExpressionVisitor visitor
            ) => visitor.Visit(this);

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

        public override void Accept(
            IClassExpressionVisitor visitor
            ) => visitor.Visit(this);

        public override bool Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            ) => evaluator.Evaluate(
                this,
                individual);
    }
}
