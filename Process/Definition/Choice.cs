using System;
using System.Collections.Generic;
using System.Linq;

namespace Process.Definition
{
    public abstract class ChoiceBase: Alternative
    {
        protected ChoiceBase()
            : base()
        {
        }

        protected ChoiceBase(
            Guid id
            )
            : base(id)
        {
        }

        public override global::Process.Process New(
            global::Process.Process parent
            )
        {
            return new global::Process.Choice(
                this,
                parent);
        }

        public abstract IEnumerable<global::Process.Alternative> NewAlternatives(
            global::Process.Process parent);
    }

    public class Choice: ChoiceBase
    {
        public IList<Alternative> Alternatives { get; set; }

        public Choice(
            params Alternative[] alternatives
            )
            : base()
        {
            Alternatives = alternatives;
        }

        public Choice(
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

            foreach(var alternative in Alternatives)
                if(!alternative.Accept(visitor))
                    return false;

            return visitor.Exit(this);
        }

        public override IEnumerable<global::Process.Alternative> NewAlternatives(
            global::Process.Process parent
            ) => Alternatives
                .Select(alternative => alternative.New(parent))
                .Cast<global::Process.Alternative>();
    }

    public class ChoiceForEach<TValue>: ChoiceBase
    {
        public Func<global::Process.Process, IEnumerable<TValue>> Values     { get; set; }
        public IReplicated<TValue>                                Replicated { get; set; }

        public ChoiceForEach()
            : base()
        {
        }

        public ChoiceForEach(
            Guid id
            )
            : base(id)
        {
        }

        public override bool Accept(
            IVisitor visitor
            ) => visitor.Enter(this);

        public override IEnumerable<global::Process.Alternative> NewAlternatives(
            global::Process.Process parent
            ) => Values(parent)
                .Select(value => Replicated.Replicate(
                    parent,
                    value))
                .Cast<global::Process.Alternative>();
    }
}
