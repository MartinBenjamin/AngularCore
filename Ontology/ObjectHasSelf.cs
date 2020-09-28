namespace Ontology
{
    public class ObjectHasSelf:
        ObjectPropertyRestriction,
        IObjectHasSelf
    {
        public ObjectHasSelf(
            IObjectPropertyExpression objectPropertyExpression
            ) : base(objectPropertyExpression)
        {
        }

        public override void Accept(
            IClassExpressionVisitor visitor
            ) => visitor.Visit(this);

        public override bool Evaluate(
            IClassMembershipEvaluator evaluator,
            object individual
            ) => evaluator.Evaluate(
                this,
                individual);
    }
}
