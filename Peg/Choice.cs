using System.Collections.Generic;

namespace Peg
{
    public class Choice: Expression
    {
        public IReadOnlyList<Expression> Children { get; private set; }

        public Choice(
            params Expression[] children
            ) : base(1)
        {
            Children = children;
        }

        public override int Parse(
            string input,
            int    position
            )
        {
            foreach(var child in Children)
            {
                var length = child.Parse(
                    input,
                    position);

                if(length >= 0)
                {
                    Match?.Invoke(
                        this,
                        input,
                        position,
                        length);

                    return length;
                }
            }

            return NoMatch(position);
        }

        public override Node Parse2(
            string input,
            int    position
            )
        {
            foreach(var child in Children)
            {
                var childNode = child.Parse2(
                    input,
                    position);

                if(childNode.Match)
                    return new NonTerminalNode(
                        this,
                        input,
                        position,
                        true,
                        [childNode]);
            }

            return new NonTerminalNode(
                this,
                input,
                position,
                false,
                []);
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

            foreach(var child in Children)
            {
                End last = null;
                foreach(var parseEvent in child.Parse3(input, position))
                {
                    yield return parseEvent;
                    last = parseEvent as End;
                }

                if(last.Match)
                {
                    yield return new End(
                        this,
                        input,
                        position,
                        last.Length,
                        true);

                    yield break;
                }
            }

            yield return new End(
                this,
                input,
                position,
                0,
                false);
        }

        public override void Write(
            IExpressionWriter writer
            )
        {
            writer.Write(this);
        }
    }
}
