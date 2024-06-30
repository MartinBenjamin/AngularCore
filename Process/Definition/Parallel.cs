using System;
using System.Collections.Generic;

namespace Process.Definition
{
    public abstract class ParallelBase:
        Process,
        ISubprocess
    {
        protected ParallelBase()
            : base()
        {
        }
    }

    public class Parallel: ParallelBase
    {
        public IList<ISubprocess> Children { get; protected set; }

        public Parallel(
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
            ISelector<TResult> selector) => selector.Select(this);
    }

    public class ParallelForEach: ParallelBase
    {
        public Func<IScope, IEnumerable<IDictionary<string, object>>> Variables  { get; set; }
        public ISubprocess                                            Replicated { get; set; }

        public ParallelForEach()
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
