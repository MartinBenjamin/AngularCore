namespace Ontology
{
    public abstract class ClassExpression: IClassExpression
    {
        protected ClassExpression() : base()
        {
        }

        public abstract void Accept(IClassExpressionVisitor visitor);

        public abstract bool Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual);
    }
}
