﻿namespace Ontology
{
    public class ObjectAllValuesFrom:
        ObjectPropertyRestriction,
        IObjectAllValuesFrom
    {
        private readonly IClassExpression _classExpression;

        public ObjectAllValuesFrom(
            IObjectPropertyExpression objectPropertyExpression,
            IClassExpression          classExpression
            ) : base(objectPropertyExpression)
        {
            _classExpression = classExpression;
        }

        IClassExpression IObjectAllValuesFrom.ClassExpression => _classExpression;

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
