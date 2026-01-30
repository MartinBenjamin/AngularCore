using System.Collections.Generic;
using System.Linq;

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
            ) => new TerminalNode(
                this,
                input,
                position,
                0,
                Expression.Parse2(
                    input,
                    position).Match);

        public override IEnumerable<Event> Parse3(
            string input,
            int    position
            )
        {
            yield return new End(
                this,
                input,
                position,
                0,
                Expression.Parse3(input, position).OfType<End>().Last().Match);
        }

        public override void Write(
            IExpressionWriter writer
            )
        {
            writer.Write(this);
        }
    }
}
