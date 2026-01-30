using System.Collections.Generic;

namespace Peg
{
    public class Sequence: Expression
    {
        public IReadOnlyList<Expression> Children { get; private set; }

        public Sequence(
            params Expression[] children
            ) : base(2)
        {
            Children = children;
        }

        public override int Parse(
            string input,
            int    position
            )
        {
            int length = 0;
            foreach(var child in Children)
            {
                var childLength = child.Parse(
                    input,
                    position + length);

                if(childLength < 0)
                    return childLength;

                length += childLength;
            }

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
            var match = true;
            IList<Node> children = [];
            var currentPosition = position;

            foreach(var child in Children)
            {
                var childNode = child.Parse2(
                    input,
                    currentPosition);

                match = childNode.Match;
                children.Add(childNode);
                currentPosition += childNode.Length;

                if(!match)
                    break;
            }

            return new NonTerminalNode(
                this,
                input,
                position,
                match,
                children);
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

            var length = 0;
            End last = null;

            foreach(var child in Children)
            {
                foreach(var parseEvent in child.Parse3(input, position + length))
                {
                    yield return parseEvent;
                    last = parseEvent as End;
                }

                length += last.Length;

                if(!last.Match)
                    break;
            }

            yield return new End(
                this,
                input,
                position,
                length,
                last?.Match ?? true);
        }

        public override void Write(
            IExpressionWriter writer
            )
        {
            writer.Write(this);
        }
    }
}
