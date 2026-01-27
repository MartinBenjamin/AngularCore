using System.Collections.Generic;
using System.Linq;

namespace Peg
{
    public abstract class Node
    {
        public Expression Expression { get; private set; }
        public string     Input      { get; private set; }
        public int        Position   { get; private set; }
        public int        Length     { get; private set; }
        public bool       Match      { get; private set; }

        protected Node(
            Expression expression,
            string     input,
            int        position,
            int        length,
            bool       match
            )
        {
            Expression = expression;
            Input      = input;
            Position   = position;
            Length     = length;
            Match      = match;
        }
    }

    public class NonTerminalNode: Node
    {
        public IReadOnlyList<Node> Children   { get; private set; }

        public NonTerminalNode(
            Expression  expression,
            string      input,
            int         position,
            bool        match,
            IList<Node> children
            ): base(
                expression,
                input,
                position,
                children.Sum(child => child.Length),
                match)
        {
            Children = children.AsReadOnly();
        }
    }

    public class TerminalNode: Node
    {
        public TerminalNode(
            Expression expression,
            string     input,
            int        position,
            int        length,
            bool       match
            ): base(
                expression,
                input,
                position,
                length,
                match)
        {
        }
    }
}
