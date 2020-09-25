namespace Ontology
{
    public interface IClassExpression
    {
        bool Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual);
    }
}
