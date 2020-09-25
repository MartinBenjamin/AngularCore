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

        bool IClassExpression.Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            ) => true;
    }
}
