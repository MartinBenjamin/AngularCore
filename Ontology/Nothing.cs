namespace Ontology
{
    internal class Nothing:
        BuiltIn,
        IClass
    {
        internal Nothing() : base(
            ReservedVocabulary.StandardPrefixNames["owl"],
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
