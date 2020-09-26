namespace Ontology
{
    public class Class:
        Entity,
        IClass
    {
        public Class(
            IOntology ontology,
            string    name
            ) : base(
                ontology,
                name)
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
            ) => evaluator.Evaluate(
                this,
                individual);
    }
}
