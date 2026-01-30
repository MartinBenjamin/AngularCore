using System.Collections.Generic;

namespace Peg
{
    public class Definition: Expression
    {
        public string     Identifier { get; private set; }

        public Expression Expression { get; set; }

        public Definition(): this(null)
        {
        }

        public Definition(
            string identifier
            ) : base(5)
        {
            Identifier = identifier;
        }

        public override int Parse(
            string input,
            int    position
            )
        {
            var length = Expression.Parse(
                input,
                position);

            if(length >= 0)
                Match?.Invoke(
                    this,
                    input,
                    position,
                    length);

            return length;
        }

        public override Node Parse2(
            string input,
            int    position
            )
        {
            var childNode = Expression.Parse2(
                input,
                position);

            return new NonTerminalNode(
                this,
                input,
                position,
                childNode.Match,
                [childNode]);
        }

        public override IEnumerable<Event> Parse3(
            string input,
            int    position
            )
        {
            yield return new Begin(
                this,
                input,
                position);

            End last = null;
            foreach(var parseEvent in Expression.Parse3(input, position))
            {
                yield return parseEvent;
                last = parseEvent as End;
            }

            yield return new End(
                this,
                input,
                position,
                last.Length,
                last.Match);
        }

        public override void Write(
            IExpressionWriter writer
            )
        {
            writer.Write(this);
        }
    }
}
