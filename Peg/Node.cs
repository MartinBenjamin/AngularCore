using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace Peg
{
    public interface INodeVisitor
    {
        void Enter(NonTerminalNode node);
        void Enter(TerminalNode    node);
        void Exit(NonTerminalNode node);
        void Exit(TerminalNode    node);
    }
    public abstract class Node: IEnumerable<Node>
    {
        public Expression Expression { get; private set; }
        public string     Input      { get; private set; }
        public int        Position   { get; private set; }
        public int        Length     { get; private set; }
        public bool       Match      { get; private set; }

        public abstract void Visit(INodeVisitor visitor);

        public abstract IEnumerator<Node> GetEnumerator();

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }

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
        public IReadOnlyList<Node> Children { get; private set; }

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

        public override void Visit(
            INodeVisitor visitor
            )
        {
            visitor.Enter(this);
            foreach(var child in Children)
                child.Visit(visitor);
            visitor.Exit(this);
        }

        public override IEnumerator<Node> GetEnumerator()
        {
            yield return this;
            foreach(var child in Children)
                yield return child;
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

        public override void Visit(
            INodeVisitor visitor
            )
        {
            visitor.Enter(this);
            visitor.Exit(this);
        }

        public override IEnumerator<Node> GetEnumerator()
        {
            yield return this;
        }
    }
}
