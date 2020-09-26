namespace Ontology
{
    public interface IClassExpression
    {
        void Accept(IClassExpressionVisitor visitor);

        bool Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual);
    }
}
