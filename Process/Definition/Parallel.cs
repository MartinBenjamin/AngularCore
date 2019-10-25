using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

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

        public override global::Process.Process New(
            global::Process.Process parent
            )
        {
            return new global::Process.Parallel(
                this,
                parent);
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

        public override IEnumerable<global::Process.Process> NewChildren(
            global::Process.Process parent
            )
        {
            return Children.Select(child => child.New(parent));
        }

        public override void ToString(
            StringBuilder builder
            )
        {
            builder
                .Append('(')
                .AppendJoin(
                    "||",
                    Children)
                .Append(')');
        }
    }

    public class ParallelForEach<TValue>: ParallelBase
    {
        public Func<global::Process.Process, IEnumerable<TValue>> Values     { get; set; }
        public IReplicated<TValue>                                Replicated { get; set; }

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

        public override IEnumerable<global::Process.Process> NewChildren(
            global::Process.Process parent
            )
        {
            return Values(parent).Select(
                value => Replicated.Replicate(
                    parent,
                    value));
        }
    }
}
