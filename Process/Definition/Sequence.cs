using System;
using System.Collections.Generic;

namespace Process.Definition
{
    public abstract class SequenceBase: Process
    {
        protected SequenceBase()
            : base()
        {
        }
    }

    public class Sequence: SequenceBase
    {
        public IList<Process> Children { get; protected set; }

        public Sequence(
            params Process[] children
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
        public Process                                                Replicated { get; set; }

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
