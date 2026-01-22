namespace Peg
{
    public class And: Expression
    {
        public Expression Expression { get; private set; }

        public And(
            Expression expression
            ) : base(3)
        {
            Expression = expression;
        }

        public override int Parse(
            string input,
            int    position
            )
        {
            return Expression.Parse(
                input,
                position) >= 0 ? 0 : NoMatch(position);
        }

        public override Node Parse2(
            string input,
            int    position
            )
        {
            var node = new Node(
                this,
                input,
                position);

            node.Match = Expression.Parse2(
                input,
                position).Match;

            return node;
        }

        public override void Write(
            IExpressionWriter writer
            )
        {
            writer.Write(this);
        }
    }
}
