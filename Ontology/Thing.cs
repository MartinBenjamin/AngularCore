namespace Ontology
{
    public class Thing:
        Entity,
        IClass
    {
        internal Thing() : base(
            null,
            "Thing")
        {
        }

        void IClassExpression.Accept(
            IClassExpressionVisitor visitor
            )
        {
            visitor.Enter(this);
            visitor.Exit(this);
        }

        bool IClassExpression.Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            ) => true;
    }
}
