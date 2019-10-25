using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

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

        public override global::Process.Process New(
            global::Process.Process parent
            )
        {
            return new global::Process.Sequence(
                this,
                parent);
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
                    ';',
                    Children)
                .Append(')');
        }
    }

    public class SequenceForEach<TValue>: SequenceBase
    {
        public Func<global::Process.Process, IEnumerable<TValue>> Values     { get; set; }
        public IReplicated<TValue>                                Replicated { get; set; }

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
