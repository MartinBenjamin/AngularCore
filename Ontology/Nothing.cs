namespace Ontology
{
    public class Nothing:
        Entity,
        IClass
    {
        internal Nothing() : base(
            null,
            "Nothing")
        {
        }

        void IClassExpression.Accept(
            IClassExpressionVisitor visitor
            ) => visitor.Visit(this);

        bool IClassExpression.Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            ) => false;
    }
}
