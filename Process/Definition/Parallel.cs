using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CommonDomainObjects.Process.Definition
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

        public override CommonDomainObjects.Process.Process New(
            CommonDomainObjects.Process.Process parent
            )
        {
            return new CommonDomainObjects.Process.Parallel(
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

        public override IEnumerable<CommonDomainObjects.Process.Process> NewChildren(
            CommonDomainObjects.Process.Process parent
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
        public Func<CommonDomainObjects.Process.Process, IEnumerable<TValue>> Values { get; set; }
        public IReplicated<TValue>                                            Replicated { get; set; }

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

        public override IEnumerable<CommonDomainObjects.Process.Process> NewChildren(
            CommonDomainObjects.Process.Process parent
            )
        {
            return Values(parent).Select(
                value => Replicated.Replicate(
                    parent,
                    value));
        }
    }
}
