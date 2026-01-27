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

        public override void Write(
            IExpressionWriter writer
            )
        {
            writer.Write(this);
        }
    }
}
