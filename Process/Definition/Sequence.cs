using System;
using System.Collections.Generic;

namespace Process.Definition
{
    public abstract class SequenceBase:
        Process,
        ISubprocess
    {
        protected SequenceBase()
            : base()
        {
        }
    }

    public class Sequence: SequenceBase
    {
        public IList<ISubprocess> Children { get; protected set; }

        public Sequence(
            params ISubprocess[] children
            )
            : base()
        {
            Children = children;
        }

        public override void Accept(
            IVisitor visitor
            ) => visitor.Visit(this);

        public override TResult Select<TResult>(
            ISelector<TResult> selector
            ) => selector.Select(this);
    }

    public class SequenceForEach: SequenceBase
    {
        public Func<IScope, IEnumerable<IDictionary<string, object>>> Variables  { get; set; }
        public ISubprocess                                            Replicated { get; set; }

        public SequenceForEach()
            : base()
        {
        }

        public override void Accept(
            IVisitor visitor
            ) => visitor.Visit(this);

        public override TResult Select<TResult>(
            ISelector<TResult> selector
            ) => selector.Select(this);
    }
}
