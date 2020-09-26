namespace Ontology
{
    public class ObjectComplementOf: IObjectComplementOf
    {
        private IClassExpression _classExpression;

        public ObjectComplementOf(
            IClassExpression classExpression
            )
        {
            _classExpression = classExpression;
        }

        IClassExpression IObjectComplementOf.ClassExpression => _classExpression;

        void IClassExpression.Accept(
            IClassExpressionVisitor visitor
            )
        {
            visitor.Enter(this);
            _classExpression.Accept(visitor);
            visitor.Exit(this);
        }

        bool IClassExpression.Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            ) => evaluator.Evaluate(
                this,
                individual);
    }
}
