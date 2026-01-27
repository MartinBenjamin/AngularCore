using CommonDomainObjects;
using System.Collections.Generic;
using System.ComponentModel;

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

                if(!match)
                    break;

                children.Add(childNode);
                currentPosition += childNode.Length;
            }

            return new NonTerminalNode(
                this,
                input,
                position,
                match,
                children);
        }

        public override void Write(
            IExpressionWriter writer
            )
        {
            writer.Write(this);
        }
    }
}
