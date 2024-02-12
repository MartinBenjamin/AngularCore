using Process.Expression;
using System;
using System.Collections.Generic;

namespace Process.Definition
{
    public abstract class SequenceBase: Composite
    {
        protected SequenceBase()
            : base()
        {
        }

        protected SequenceBase(
            Guid id
            )
            : base(id)
        {
        }
    }

    public class Sequence: SequenceBase
    {
        public IList<Process> Children { get; set; }

        public Sequence(
            params Process[] children
            )
            : base()
        {
            Children = children;
        }

        public Sequence(
            Guid id
            )
            : base(id)
        {
        }

        public override void Accept(
            IVisitor visitor
            ) => visitor.Visit(this);

        public override TResult Select<TResult>(
            ISelector<TResult> selector) => selector.Select(this);
    }

    public class SequenceForEach: SequenceBase
    {
        public IExpression<IEnumerable<IDictionary<string, object>>> Variables  { get; set; }
        public Process                                               Replicated { get; set; }

        public SequenceForEach()
            : base()
        {
        }

        public SequenceForEach(
            Guid id
            )
            : base(id)
        {
        }

        public override void Accept(
            IVisitor visitor
            ) => visitor.Visit(this);

        public override TResult Select<TResult>(
            ISelector<TResult> selector) => selector.Select(this);
    }
}
