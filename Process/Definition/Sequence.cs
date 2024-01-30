using Process.Expression;
using System;
using System.Collections.Generic;
using System.Linq;

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
            global::Process.Process     parent,
            IDictionary<string, object> variables = null
            ) => new global::Process.Sequence(
                this,
                parent,
                variables);
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

        public override bool Accept(
            IVisitor visitor
            )
        {
            if(!visitor.Enter(this))
                return false;

            foreach(var child in Children)
                if(!child.Accept(visitor))
                    return false;

            return visitor.Exit(this);
        }

        public override IEnumerable<global::Process.Process> NewChildren(
            global::Process.Process parent
            ) => Children.Select(child => child.New(parent));
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

        public override bool Accept(
            IVisitor visitor
            ) => visitor.Enter(this);

        public override IEnumerable<global::Process.Process> NewChildren(
            global::Process.Process parent
            ) => Variables.Evaluate(parent).Select(variables => Replicated.New(parent, variables));
    }
}
