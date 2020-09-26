﻿namespace Ontology
{
    public class ObjectSomeValuesFrom:
        ObjectPropertyRestriction,
        IObjectSomeValuesFrom
    {
        private IClassExpression _classExpression;

        public ObjectSomeValuesFrom(
            IObjectPropertyExpression objectPropertyExpression,
            IClassExpression          classExpression
            ) : base(objectPropertyExpression)
        {
            _classExpression = classExpression;
        }

        IClassExpression IObjectSomeValuesFrom.ClassExpression => _classExpression;

        public override void Accept(
            IClassExpressionVisitor visitor
            )
        {
            visitor.Enter(this);
            _classExpression.Accept(visitor);
            visitor.Exit(this);
        }

        public override bool Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            ) => evaluator.Evaluate(
                this,
                individual);
    }
}
