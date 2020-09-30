namespace Ontology
{
    public class Class:
        Entity,
        IClass
    {
        public Class(
            IOntology ontology,
            string    localName
            ) : base(
                ontology,
                localName)
        {
        }

        void IClassExpression.Accept(
            IClassExpressionVisitor visitor
            ) => visitor.Visit(this);

        bool IClassExpression.Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            ) => evaluator.Evaluate(
                this,
                individual);
    }
}
