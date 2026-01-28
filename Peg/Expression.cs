using System.Collections.Generic;
using System.Text;

namespace Peg
{
    public delegate void Match(
        Expression expression,
        string     input,
        int        position,
        int        length);

    public abstract class Expression
    {
        public Match Match { get; set; }

        public int Precedence { get; private set; }

        protected Expression(
            int precedence
            )
        {
            Precedence = precedence;
        }

        protected int NoMatch(
            int position
            )
        {
            return -(position + 1);
        }

        public abstract int Parse(
            string input,
            int    position);

        public abstract Node Parse2(
            string input,
            int position);

        public virtual IEnumerable<Event> Parse3(
            string input,
            int    position) => null;

        public abstract void Write(IExpressionWriter writer);

        public override string ToString()
        {
            var builder = new StringBuilder();
            Write(new ExpressionWriter(builder));
            return builder.ToString();
        }
    }
}
