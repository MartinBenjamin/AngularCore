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

        bool IClassExpression.Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            ) => false;
    }
}
