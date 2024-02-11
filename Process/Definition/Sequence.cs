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
            Guid                        id,
            global::Process.Process     parent,
            IDictionary<string, object> variables = null
            ) => new global::Process.Sequence(
                id,
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

        public override void Accept(
            IVisitor visitor
            ) => visitor.Visit(this);

        public override TResult Select<TResult>(
            ISelector<TResult> selector) => selector.Select(this);

        public override IList<global::Process.Process> NewChildren(
            IIdService<Guid>        idService,
            global::Process.Process parent
            ) => Children.Select(
                child => child.New(
                    idService.NewId(),
                    parent)).ToList();
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

        public override IList<global::Process.Process> NewChildren(
            IIdService<Guid>        idService,
            global::Process.Process parent
            ) => Variables.Evaluate(parent).Select(variables => Replicated.New(
                idService.NewId(),  
                parent,
                variables)).ToList();
    }
}
