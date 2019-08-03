using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CommonDomainObjects.Process.Definition
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

        public override CommonDomainObjects.Process.Process New(
            CommonDomainObjects.Process.Process parent
            )
        {
            return new CommonDomainObjects.Process.Choice(
                this,
                parent);
        }

        public abstract IEnumerable<CommonDomainObjects.Process.Alternative> NewAlternatives(
            CommonDomainObjects.Process.Process parent);
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

        public override IEnumerable<CommonDomainObjects.Process.Alternative> NewAlternatives(
            CommonDomainObjects.Process.Process parent
            )
        {
            return Alternatives
                .Select(alternative => alternative.New(parent))
                .Cast<CommonDomainObjects.Process.Alternative>();
        }

        public override void ToString(
            StringBuilder builder
            )
        {
            builder
                .Append('(')
                .AppendJoin(
                    '|',
                    Alternatives)
                .Append(')');
        }
    }

    public class ChoiceForEach<TValue>: ChoiceBase
    {
        public Func<CommonDomainObjects.Process.Process, IEnumerable<TValue>> Values     { get; set; }
        public IReplicated<TValue>                                            Replicated { get; set; }

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

        public override IEnumerable<CommonDomainObjects.Process.Alternative> NewAlternatives(
            CommonDomainObjects.Process.Process parent
            )
        {
            return Values(parent)
                .Select(value => Replicated.Replicate(
                    parent,
                    value))
                .Cast<CommonDomainObjects.Process.Alternative>();
        }
    }
}
