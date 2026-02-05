using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace Peg
{
    public class Node: IEnumerable<Node>
    {
        public Expression          Expression { get; private set; }
        public string              Input      { get; private set; }
        public int                 Position   { get; private set; }
        public int                 Length     { get; private set; }
        public bool                Match      { get; private set; }
        public IReadOnlyList<Node> Children   { get; private set; }

        public Node(
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
            Children   = [];
        }   

        public Node(
            Expression  expression,
            string      input,
            int         position,
            bool        match,
            IList<Node> children
            )
        {
            Expression = expression;
            Input      = input;
            Position   = position;
            Length     = children.Sum(child => child.Length);
            Match      = match;
            Children   = children.AsReadOnly();
        }

        public string Value
        {
            get => Input.Substring(
                Position,
                Length);
        }

        public IEnumerator<Node> GetEnumerator()
        {
            yield return this;
            foreach(var child in Children)
                foreach(var node in child)
                    yield return node;
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }

    public static class NodeExtensions
    {
        public static void Visit(
            this Node node,
            Action<Node> enter,
            Action<Node> exit = null
            )
        {
            enter?.Invoke(node);

            foreach(var child in node.Children)
                child.Visit(
                    enter,
                    exit);

            exit?.Invoke(node);
        }
    }
}
