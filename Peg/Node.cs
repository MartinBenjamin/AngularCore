using System.Collections.Generic;
using System.Linq;

namespace Peg
{
    public class Node
    {
        public Expression  Expression { get; private set; }
        public string      Input      { get; private set; }
        public int         Position   { get; private set; }
        public int         Length     { get; set; }
        public bool        Match      { get; set; } = true;
        public IList<Node> Children   { get; private set; } = [];

        public Node(
            Expression expression,
            string     input,
            int        position
            )
        {
            Expression = expression;
            Input      = input;
            Position   = position;
        }
    }
}
