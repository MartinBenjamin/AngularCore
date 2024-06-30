using System;
using System.Collections.Generic;

namespace Process.Definition
{
    public abstract class ChoiceBase:
        Process,
        ISubprocess,
        IAlternative
    {
        protected ChoiceBase()
            : base()
        {
        }
    }

    public class Choice: ChoiceBase
    {
        public IList<IAlternative> Alternatives { get; set; }

        public Choice(
            params IAlternative[] alternatives
            )
            : base()
        {
            Alternatives = alternatives;
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

        public override void Accept(
            IVisitor visitor
            ) => visitor.Visit(this);

        public override TResult Select<TResult>(
            ISelector<TResult> selector
            ) => selector.Select(this);
    }
}
