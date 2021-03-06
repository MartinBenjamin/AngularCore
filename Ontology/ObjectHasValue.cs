﻿namespace Ontology
{
    public class ObjectHasValue:
        ObjectPropertyRestriction,
        IObjectHasValue
    {
        private readonly object _individual;

        public ObjectHasValue(
            IObjectPropertyExpression objectPropertyExpression,
            object                    individual
            ) : base(objectPropertyExpression)
        {
            _individual = individual;
        }

        object IObjectHasValue.Individual => _individual;

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
