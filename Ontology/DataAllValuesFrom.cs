﻿namespace Ontology
{
    public class DataAllValuesFrom:
         DataPropertyRestriction,
         IDataAllValuesFrom
    {
        private readonly IDataRange _dataRange;

        public DataAllValuesFrom(
            IDataPropertyExpression dataPropertyExpression,
            IDataRange              dataRange
            ) : base(dataPropertyExpression)
        {
            _dataRange = dataRange;
        }

        IDataRange IDataAllValuesFrom.DataRange => _dataRange;

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
