using Process.Expression;
using System;
using System.Collections.Generic;

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

        public override void Accept(
            IVisitor visitor
            ) => visitor.Visit(this);

        public override TResult Select<TResult>(
            ISelector<TResult> selector) => selector.Select(this);
    }

    public class ChoiceForEach: ChoiceBase
    {
        public Func<IScope, IEnumerable<IDictionary<string, object>>> Variables  { get; set; }
        public Process                                                Replicated { get; set; }

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

        public override void Accept(
            IVisitor visitor
            ) => visitor.Visit(this);

        public override TResult Select<TResult>(
            ISelector<TResult> selector
            ) => selector.Select(this);
    }
}
