using Process.Expression;
using System;
using System.Collections.Generic;

namespace Process.Definition
{
    public abstract class ParallelBase: Composite
    {
        protected ParallelBase()
            : base()
        {
        }

        protected ParallelBase(
            Guid id
            )
            : base(id)
        {
        }
    }

    public class Parallel: ParallelBase
    {
        public IList<Process> Children { get; set; }

        public Parallel(
            params Process[] children
            )
            : base()
        {
            Children = children;
        }

        public Parallel(
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

    public class ParallelForEach: ParallelBase
    {
        public IExpression<IEnumerable<IDictionary<string, object>>> Variables  { get; set; }
        public Process                                               Replicated { get; set; }

        public ParallelForEach()
            : base()
        {
        }

        public ParallelForEach(
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
