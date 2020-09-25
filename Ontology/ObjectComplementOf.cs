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
                
        bool IClassExpression.Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            ) => evaluator.Evaluate(
                this,
                individual);
    }
}
