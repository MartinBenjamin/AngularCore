namespace Ontology
{
    internal class Thing:
        BuiltIn,
        IClass
    {
        internal Thing() : base(
            ReservedVocabulary.StandardPrefixNames["owl"],
            "Thing")
        {
        }

        void IClassExpression.Accept(
            IClassExpressionVisitor visitor
            ) => visitor.Visit(this);

        bool IClassExpression.Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual
            ) => true;
    }
}
